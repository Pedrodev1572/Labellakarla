import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile, writeJsonFile, initializeDataFiles } from "@/lib/data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await initializeDataFiles()
    const orders = await readJsonFile("orders.json")
    const order = orders.find((o: any) => o.id === params.id)

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Erro ao buscar pedido:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await initializeDataFiles()
    const { status } = await request.json()
    const orders = await readJsonFile("orders.json")

    const orderIndex = orders.findIndex((o: any) => o.id === params.id)

    if (orderIndex === -1) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      status,
      updatedAt: new Date().toISOString(),
    }

    await writeJsonFile("orders.json", orders)

    console.log(`Status do pedido ${params.id} atualizado para: ${status}`)

    return NextResponse.json({
      message: "Status do pedido atualizado com sucesso",
      order: orders[orderIndex],
    })
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
