import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .order("apellido");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const supabase = createAdminClient();

  // clerk_id is required (NOT NULL). For manually-created profiles,
  // use a placeholder — the webhook will link it when the user signs up with Clerk.
  const clerk_id = body.clerk_id ?? `manual_${crypto.randomUUID()}`;

  const { data, error } = await supabase
    .from("perfiles")
    .insert({ ...body, clerk_id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
