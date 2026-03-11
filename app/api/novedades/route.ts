import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const senal_id  = searchParams.get("senal_id");
  const estado    = searchParams.get("estado");
  const prioridad = searchParams.get("prioridad");
  const categoria = searchParams.get("categoria"); // slug
  const activas   = searchParams.get("activas");

  const supabase = createAdminClient();

  let query = supabase
    .from("novedades")
    .select(`
      *,
      senal:senales(id, nombre, codigo),
      categoria:categorias_novedades(id, nombre, label),
      opcion:opciones_novedades(id, label),
      reportado_por:perfiles!reportado_por_id(id, nombre, apellido),
      asignado_a:perfiles!asignado_a_id(id, nombre, apellido)
    `)
    .order("fecha_reporte", { ascending: false });

  if (senal_id)  query = query.eq("senal_id", senal_id);
  if (estado)    query = query.eq("estado", estado);
  if (prioridad) query = query.eq("prioridad", prioridad);
  if (activas === "true")  query = query.in("estado", ["pendiente", "en_curso"]);
  if (activas === "false") query = query.in("estado", ["resuelta", "cancelada"]);

  // Filter by categoria slug via join
  if (categoria) {
    const { data: catRow } = await supabase
      .from("categorias_novedades").select("id").eq("nombre", categoria).single();
    if (catRow) query = query.eq("categoria_id", catRow.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const supabase = createAdminClient();

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!perfil) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });

  const body = await request.json();

  // Resolve categoria slug → ID
  const categoriaSlug = String(body.categoria ?? "").trim().toLowerCase();
  const { data: catRow } = await supabase
    .from("categorias_novedades")
    .select("id")
    .eq("nombre", categoriaSlug)
    .single();

  if (!catRow) return NextResponse.json({ error: `Categoría inválida: "${categoriaSlug}"` }, { status: 400 });

  // Resolve opcion slug → ID (optional)
  let opcion_id: number | null = null;
  if (body.opcion) {
    const { data: opRow } = await supabase
      .from("opciones_novedades")
      .select("id")
      .eq("nombre", body.opcion)
      .single();
    opcion_id = opRow?.id ?? null;
  }

  const { data, error } = await supabase
    .from("novedades")
    .insert({
      senal_id:        body.senal_id,
      categoria_id:    catRow.id,
      opcion_id,
      descripcion:     body.descripcion,
      prioridad:       body.prioridad,
      asignado_a_id:   body.asignado_a_id || null,
      reportado_por_id: perfil.id,
      fecha_reporte:   new Date().toISOString(),
      estado:          "pendiente",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
