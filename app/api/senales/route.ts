import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tipo      = searchParams.get("tipo");
  const estado    = searchParams.get("estado");
  const provincia = searchParams.get("provincia");
  const busqueda  = searchParams.get("q");

  const supabase = createAdminClient();

  let query = supabase
    .from("senales")
    .select(`
      *,
      categoria:categorias_senales(id, nombre, label),
      estado:estados_senales(id, nombre, label, color_hex),
      encargado:perfiles!encargado_id(id, nombre, apellido)
    `)
    .eq("activo", true)
    .order("nombre");

  if (tipo) {
    const { data: cat } = await supabase
      .from("categorias_senales").select("id").eq("nombre", tipo).single();
    if (cat) query = query.eq("categoria_id", cat.id);
  }

  if (estado) {
    const { data: est } = await supabase
      .from("estados_senales").select("id").eq("nombre", estado).single();
    if (est) query = query.eq("estado_id", est.id);
  }

  if (provincia) query = query.eq("provincia", provincia);
  if (busqueda)  query = query.or(`nombre.ilike.%${busqueda}%,codigo.ilike.%${busqueda}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("senales")
    .insert(body)
    .select(`*, categoria:categorias_senales(id,nombre,label), estado:estados_senales(id,nombre,label,color_hex)`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
