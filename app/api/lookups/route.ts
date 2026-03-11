import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORIAS_NOVEDADES } from "@/constants/categorias-novedades";

const SEED_CATEGORIAS = [
  { nombre: "faro",   label: "Faro",   activo: true },
  { nombre: "boya",   label: "Boya",   activo: true },
  { nombre: "baliza", label: "Baliza", activo: true },
];

const SEED_ESTADOS = [
  { nombre: "en_servicio",  label: "En servicio",  color_hex: "#4ade80", activo: true },
  { nombre: "sin_servicio", label: "Sin servicio", color_hex: "#f87171", activo: true },
  { nombre: "caido",        label: "Caído",        color_hex: "#fb923c", activo: true },
  { nombre: "dañado",       label: "Dañado",       color_hex: "#fbbf24", activo: true },
];

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const supabase = createAdminClient();

  let [cats, ests, perfiles, catNov] = await Promise.all([
    supabase.from("categorias_senales").select("*").eq("activo", true).order("id"),
    supabase.from("estados_senales").select("*").eq("activo", true).order("id"),
    supabase.from("perfiles").select("id, nombre, apellido, rol").eq("activo", true).order("apellido"),
    supabase.from("categorias_novedades").select("id, nombre").order("id"),
  ]);

  // Auto-seed categorias_senales if empty
  if (!cats.data || cats.data.length === 0) {
    await supabase.from("categorias_senales").insert(SEED_CATEGORIAS);
    cats = await supabase.from("categorias_senales").select("*").eq("activo", true).order("id");
  }

  // Auto-seed estados_senales if empty
  if (!ests.data || ests.data.length === 0) {
    await supabase.from("estados_senales").insert(SEED_ESTADOS);
    ests = await supabase.from("estados_senales").select("*").eq("activo", true).order("id");
  }

  // Auto-seed categorias_novedades + opciones_novedades if empty
  if (!catNov.data || catNov.data.length === 0) {
    await supabase.from("categorias_novedades").insert(
      CATEGORIAS_NOVEDADES.map((c) => ({ nombre: c.id, label: c.label }))
    );
    catNov = await supabase.from("categorias_novedades").select("id, nombre").order("id");

    if (catNov.data && catNov.data.length > 0) {
      const catMap = Object.fromEntries(catNov.data.map((c) => [c.nombre, c.id]));
      const opciones = CATEGORIAS_NOVEDADES.flatMap((cat) =>
        cat.opciones.map((op) => ({
          categoria_id: catMap[cat.id],
          nombre: op.id,
          label: op.label,
        }))
      );
      await supabase.from("opciones_novedades").insert(opciones);
    }
  }

  return NextResponse.json({
    categorias_senales: cats.data  ?? [],
    estados_senales:    ests.data  ?? [],
    perfiles:           perfiles.data ?? [],
  });
}
