import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile, writeJsonFile, initializeDataFiles } from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    await initializeDataFiles()
    const machines = await readJsonFile("machines.json")
    let updatedCount = 0

    for (const machine of machines) {
      let needsUpdate = false
      const originalStatus = machine.status

      // Só aplicar verificações automáticas se a máquina não foi modificada recentemente pelo admin
      const lastModified = machine.lastModified ? new Date(machine.lastModified) : new Date(0)
      const now = new Date()
      const timeSinceModification = now.getTime() - lastModified.getTime()
      const hoursFromModification = timeSinceModification / (1000 * 60 * 60)

      // Se foi modificada pelo admin nas últimas 24 horas, não aplicar verificações automáticas
      if (hoursFromModification < 24) {
        console.log(
          `Máquina ${machine.name} foi modificada recentemente (${hoursFromModification.toFixed(1)}h atrás), pulando verificação automática`,
        )
        continue
      }

      // Verificar se precisa de manutenção baseado nas horas (apenas se não foi alterada recentemente)
      if (machine.hoursUsed >= machine.maxHours * 0.95 && machine.status === "operational") {
        machine.status = "maintenance_needed"
        machine.notes = `Manutenção urgente necessária - ${((machine.hoursUsed / machine.maxHours) * 100).toFixed(1)}% das horas de uso atingidas`
        needsUpdate = true
        console.log(`Máquina ${machine.name}: Status alterado para manutenção necessária (95% das horas)`)
      } else if (machine.hoursUsed >= machine.maxHours * 0.9 && machine.status === "operational") {
        machine.notes = `Atenção: ${((machine.hoursUsed / machine.maxHours) * 100).toFixed(1)}% das horas de uso atingidas`
        needsUpdate = true
        console.log(`Máquina ${machine.name}: Aviso de 90% das horas atingidas`)
      }

      // Verificar se a data de manutenção passou (apenas se não foi alterada recentemente)
      const nextMaintenanceDate = new Date(machine.nextMaintenance)
      const today = new Date()
      const diffDays = Math.ceil((nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays <= -7 && machine.status === "operational") {
        // Manutenção atrasada há mais de 7 dias
        machine.status = "maintenance_needed"
        machine.notes = `Manutenção urgente - atrasada há ${Math.abs(diffDays)} dias`
        needsUpdate = true
        console.log(`Máquina ${machine.name}: Manutenção atrasada há ${Math.abs(diffDays)} dias`)
      } else if (diffDays <= 0 && machine.status === "operational") {
        machine.notes = `Manutenção programada vencida há ${Math.abs(diffDays)} dias`
        needsUpdate = true
        console.log(`Máquina ${machine.name}: Manutenção vencida há ${Math.abs(diffDays)} dias`)
      } else if (diffDays <= 7 && diffDays > 0 && machine.status === "operational") {
        machine.notes = `Manutenção programada em ${diffDays} dias`
        needsUpdate = true
        console.log(`Máquina ${machine.name}: Manutenção em ${diffDays} dias`)
      }

      if (needsUpdate) {
        updatedCount++
        console.log(`Máquina ${machine.name}: ${originalStatus} → ${machine.status} (${machine.notes})`)
      }
    }

    if (updatedCount > 0) {
      await writeJsonFile("machines.json", machines)
      console.log(`${updatedCount} máquinas atualizadas automaticamente`)
    }

    return NextResponse.json({
      message: `${updatedCount} máquinas atualizadas`,
      updatedCount,
    })
  } catch (error) {
    console.error("Erro ao verificar manutenção das máquinas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
