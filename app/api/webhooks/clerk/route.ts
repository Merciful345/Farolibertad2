import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente con service role — bypasea RLS para operaciones del webhook
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserData;
}

function getPrimaryEmail(data: ClerkUserData): string {
  const primary = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  );
  return primary?.email_address ?? data.email_addresses[0]?.email_address ?? "";
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "CLERK_WEBHOOK_SECRET no configurado" }, { status: 500 });
  }

  // Verificar firma de Svix
  const headerPayload = await headers();
  const svix_id        = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Headers de Svix faltantes" }, { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let event: ClerkWebhookEvent;
  try {
    event = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const { type, data } = event;

  // ── user.created ────────────────────────────────────────────────────────────
  if (type === "user.created") {
    const email = getPrimaryEmail(data);

    // Check if a manually-created profile already exists for this email
    const { data: existing } = await supabase
      .from("perfiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      // Link the existing profile to this Clerk user
      const { error } = await supabase
        .from("perfiles")
        .update({ clerk_id: data.id, activo: true })
        .eq("id", existing.id);
      if (error) {
        console.error("[webhook] user.created link error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // New user without a pre-existing profile → inactive until an admin activates them
      const { error } = await supabase.from("perfiles").insert({
        clerk_id: data.id,
        nombre:   data.first_name ?? "",
        apellido: data.last_name  ?? "",
        email,
        rol:      "observador",
        activo:   false,
      });
      if (error) {
        console.error("[webhook] user.created error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  // ── user.updated ────────────────────────────────────────────────────────────
  if (type === "user.updated") {
    const { error } = await supabase
      .from("perfiles")
      .update({
        nombre:   data.first_name ?? "",
        apellido: data.last_name  ?? "",
        email:    getPrimaryEmail(data),
      })
      .eq("clerk_id", data.id);

    if (error) {
      console.error("[webhook] user.updated error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // ── user.deleted ────────────────────────────────────────────────────────────
  if (type === "user.deleted") {
    // Soft delete: desactivar en lugar de borrar para preservar historial
    const { error } = await supabase
      .from("perfiles")
      .update({ activo: false })
      .eq("clerk_id", data.id);

    if (error) {
      console.error("[webhook] user.deleted error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
