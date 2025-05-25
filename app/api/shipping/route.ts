import { NextResponse } from "next/server"
import { readJsonFile } from "@/lib/data"

export async function GET() {
  try {
    const shipping = await readJsonFile("shipping.json")
    return NextResponse.json(shipping)
  } catch (error) {
    console.error("Erro ao buscar regiões de entrega:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
