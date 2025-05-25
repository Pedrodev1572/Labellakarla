import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile, writeJsonFile } from "@/lib/data"
import { generateId } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const complementData = await request.json()
    const complements = await readJsonFile("complements.json")

    const newComplement = {
      ...complementData,
      id: generateId(),
    }

    complements.push(newComplement)
    await writeJsonFile("complements.json", complements)

    return NextResponse.json({ message: "Complemento criado com sucesso", complement: newComplement }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar complemento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const complementData = await request.json()
    const complements = await readJsonFile("complements.json")

    const complementIndex = complements.findIndex((c: any) => c.id === complementData.id)
    if (complementIndex === -1) {
      return NextResponse.json({ error: "Complemento não encontrado" }, { status: 404 })
    }

    complements[complementIndex] = complementData
    await writeJsonFile("complements.json", complements)

    return NextResponse.json({ message: "Complemento atualizado com sucesso", complement: complementData })
  } catch (error) {
    console.error("Erro ao atualizar complemento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
