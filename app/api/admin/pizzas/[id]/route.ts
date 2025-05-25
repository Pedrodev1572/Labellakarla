import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile, writeJsonFile } from "@/lib/data"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pizzas = await readJsonFile("pizzas.json")
    const filteredPizzas = pizzas.filter((p: any) => p.id !== params.id)

    if (filteredPizzas.length === pizzas.length) {
      return NextResponse.json({ error: "Pizza não encontrada" }, { status: 404 })
    }

    await writeJsonFile("pizzas.json", filteredPizzas)

    return NextResponse.json({ message: "Pizza excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir pizza:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
