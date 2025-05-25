import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile, writeJsonFile } from "@/lib/data"

export async function GET() {
  try {
    const machines = await readJsonFile("machines.json")
    return NextResponse.json(machines)
  } catch (error) {
    console.error("Erro ao buscar máquinas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedMachine = await request.json()
    const machines = await readJsonFile("machines.json")

    const machineIndex = machines.findIndex((m: any) => m.id === updatedMachine.id)

    if (machineIndex === -1) {
      return NextResponse.json({ error: "Máquina não encontrada" }, { status: 404 })
    }

    // Atualizar a máquina com todos os dados recebidos
    machines[machineIndex] = {
      ...machines[machineIndex],
      ...updatedMachine,
      // Garantir que números sejam tratados corretamente
      hoursUsed: Number(updatedMachine.hoursUsed) || machines[machineIndex].hoursUsed,
      maxHours: Number(updatedMachine.maxHours) || machines[machineIndex].maxHours,
      // Garantir que o status seja preservado conforme definido pelo admin
      status: updatedMachine.status,
      // Atualizar timestamp da última modificação
      lastModified: new Date().toISOString(),
    }

    // Se o admin mudou o status para operacional, limpar notas automáticas
    if (updatedMachine.status === "operational") {
      // Limpar apenas notas automáticas, preservar notas manuais
      if (
        machines[machineIndex].notes &&
        (machines[machineIndex].notes.includes("Manutenção necessária") ||
          machines[machineIndex].notes.includes("90% das horas") ||
          machines[machineIndex].notes.includes("data de manutenção vencida"))
      ) {
        machines[machineIndex].notes = "Status atualizado manualmente pelo administrador"
      }
    }

    await writeJsonFile("machines.json", machines)

    console.log(`Máquina ${updatedMachine.id} atualizada:`, {
      id: machines[machineIndex].id,
      name: machines[machineIndex].name,
      status: machines[machineIndex].status,
      hoursUsed: machines[machineIndex].hoursUsed,
      maxHours: machines[machineIndex].maxHours,
      notes: machines[machineIndex].notes,
    })

    return NextResponse.json({
      message: "Máquina atualizada com sucesso",
      machine: machines[machineIndex],
    })
  } catch (error) {
    console.error("Erro ao atualizar máquina:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
