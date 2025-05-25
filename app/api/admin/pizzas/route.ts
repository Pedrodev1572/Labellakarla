import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile, writeJsonFile } from "@/lib/data"
import { generateId } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const pizzaData = await request.json()
    const pizzas = await readJsonFile("pizzas.json")

    const newPizza = {
      ...pizzaData,
      id: generateId(),
    }

    pizzas.push(newPizza)
    await writeJsonFile("pizzas.json", pizzas)

    return NextResponse.json({ message: "Pizza criada com sucesso", pizza: newPizza }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar pizza:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const pizzaData = await request.json()
    const pizzas = await readJsonFile("pizzas.json")

    const pizzaIndex = pizzas.findIndex((p: any) => p.id === pizzaData.id)
    if (pizzaIndex === -1) {
      return NextResponse.json({ error: "Pizza não encontrada" }, { status: 404 })
    }

    pizzas[pizzaIndex] = pizzaData
    await writeJsonFile("pizzas.json", pizzas)

    return NextResponse.json({ message: "Pizza atualizada com sucesso", pizza: pizzaData })
  } catch (error) {
    console.error("Erro ao atualizar pizza:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
