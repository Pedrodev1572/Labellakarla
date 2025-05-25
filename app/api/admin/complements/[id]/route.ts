import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile, writeJsonFile } from "@/lib/data"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const complements = await readJsonFile("complements.json")

    const complementIndex = complements.findIndex((c: any) => c.id === id)
    if (complementIndex === -1) {
      return NextResponse.json({ error: "Complemento não encontrado" }, { status: 404 })
    }

    complements.splice(complementIndex, 1)
    await writeJsonFile("complements.json", complements)

    return NextResponse.json({ message: "Complemento excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir complemento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
