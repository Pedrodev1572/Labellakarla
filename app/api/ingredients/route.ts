import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile, writeJsonFile } from "@/lib/data"

export async function GET() {
  try {
    const ingredients = await readJsonFile("ingredients.json")
    return NextResponse.json(ingredients)
  } catch (error) {
    console.error("Erro ao buscar ingredientes:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, stock } = await request.json()
    const ingredients = await readJsonFile("ingredients.json")

    const ingredientIndex = ingredients.findIndex((i: any) => i.id === id)

    if (ingredientIndex === -1) {
      return NextResponse.json({ error: "Ingrediente não encontrado" }, { status: 404 })
    }

    ingredients[ingredientIndex] = {
      ...ingredients[ingredientIndex],
      stock,
      lastUpdated: new Date().toISOString(),
    }

    await writeJsonFile("ingredients.json", ingredients)

    return NextResponse.json({
      message: "Estoque atualizado com sucesso",
      ingredient: ingredients[ingredientIndex],
    })
  } catch (error) {
    console.error("Erro ao atualizar ingrediente:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
