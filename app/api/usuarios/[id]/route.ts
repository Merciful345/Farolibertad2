import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const ROLES_GESTORES = ["administrador", "encargado_estacion"];

async function getCallerPerfil(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("perfiles").select("id, rol").eq("clerk_id", userId).single();
  return data as { id: string; rol: string } | null;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("perfiles").select("*").eq("id", id).single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const caller = await getCallerPerfil(supabase, userId);
  if (!caller || !ROLES_GESTORES.includes(caller.rol)) {
    return NextResponse.json({ error: "Sin permiso para editar usuarios" }, { status: 403 });
  }

  if (caller.rol === "encargado_estacion") {
    const { data: target } = await supabase.from("perfiles").select("rol").eq("id", id).single();
    if ((target as { rol: string } | null)?.rol === "administrador") {
      return NextResponse.json({ error: "No podés editar un administrador" }, { status: 403 });
    }
  }

  const body = await request.json();
  const { data, error } = await supabase
    .from("perfiles")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const caller = await getCallerPerfil(supabase, userId);
  if (!caller || !ROLES_GESTORES.includes(caller.rol)) {
    return NextResponse.json({ error: "Sin permiso para dar de baja usuarios" }, { status: 403 });
  }

  if (caller.rol === "encargado_estacion") {
    const { data: target } = await supabase.from("perfiles").select("rol").eq("id", id).single();
    if ((target as { rol: string } | null)?.rol === "administrador") {
      return NextResponse.json({ error: "No podés dar de baja a un administrador" }, { status: 403 });
    }
  }

  const { error } = await supabase
    .from("perfiles")
    .update({ activo: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: null });
}
