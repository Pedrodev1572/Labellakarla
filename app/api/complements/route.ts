import { NextResponse } from "next/server"
import { readJsonFile } from "@/lib/data"

export async function GET() {
  try {
    const complements = await readJsonFile("complements.json")
    return NextResponse.json(complements)
  } catch (error) {
    console.error("Erro ao buscar complementos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
