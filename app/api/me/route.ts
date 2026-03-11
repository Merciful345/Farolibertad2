import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("perfiles")
    .select("id, nombre, apellido, email, rol")
    .eq("clerk_id", userId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const supabase = createAdminClient();
  const body = await request.json();

  // Only allow updating safe fields (not rol, not clerk_id)
  const { nombre, apellido } = body;

  const { data, error } = await supabase
    .from("perfiles")
    .update({ nombre, apellido, updated_at: new Date().toISOString() })
    .eq("clerk_id", userId)
    .select("id, nombre, apellido, email, rol")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
