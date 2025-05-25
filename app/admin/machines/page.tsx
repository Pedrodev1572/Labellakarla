"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, CheckCircle, Clock, Save, RefreshCw, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useAdmin } from "@/contexts/admin-context"
import { useToast } from "@/hooks/use-toast"

interface Machine {
  id: string
  name: string
  type: string
  installDate: string
  lastMaintenance: string
  nextMaintenance: string
  status: string
  hoursUsed: number
  maxHours: number
  notes: string
  lastModified?: string
}

export default function AdminMachinesPage() {
  const { user } = useAuth()
  const { triggerUpdate, lastUpdate } = useAdmin()
  const router = useRouter()
  const { toast } = useToast()
  const [machines, setMachines] = useState<Machine[]>([])
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login")
      return
    }

    fetchMachines()
  }, [user, router, lastUpdate])

  useEffect(() => {
    if (!user || user.role !== "admin") return

    // Atualização automática a cada 2 minutos
    const interval = setInterval(() => {
      fetchMachines()
    }, 120000)

    return () => clearInterval(interval)
  }, [user])

  const fetchMachines = async () => {
    try {
      const response = await fetch("/api/machines")
      const data = await response.json()
      setMachines(data)
      console.log(
        "Máquinas carregadas:",
        data.map((m: any) => ({ id: m.id, name: m.name, status: m.status })),
      )
    } catch (error) {
      console.error("Erro ao carregar máquinas:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar máquinas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateMachine = async () => {
    if (!editingMachine) return

    setIsUpdating(true)
    try {
      console.log("Enviando atualização da máquina:", {
        id: editingMachine.id,
        name: editingMachine.name,
        status: editingMachine.status,
        hoursUsed: editingMachine.hoursUsed,
        maxHours: editingMachine.maxHours,
        notes: editingMachine.notes,
      })

      const response = await fetch("/api/machines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMachine),
      })

      const responseData = await response.json()

      if (response.ok) {
        console.log("Máquina atualizada com sucesso:", responseData.machine)

        // Atualizar imediatamente após mudança
        await fetchMachines()

        // Notificar outras páginas admin
        triggerUpdate()

        setEditingMachine(null)
        setIsDialogOpen(false)

        toast({
          title: "Máquina atualizada!",
          description: `${editingMachine.name} foi atualizada com sucesso`,
        })
      } else {
        throw new Error(responseData.error || "Erro ao atualizar máquina")
      }
    } catch (error) {
      console.error("Erro ao atualizar máquina:", error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar máquina",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const openEditDialog = (machine: Machine) => {
    console.log("Abrindo edição para máquina:", machine.name, "Status atual:", machine.status)
    setEditingMachine({ ...machine })
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Operacional
          </Badge>
        )
      case "maintenance_needed":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Manutenção Necessária
          </Badge>
        )
      case "under_maintenance":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="h-3 w-3 mr-1" />
            Em Manutenção
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const isMaintenanceDue = (nextMaintenance: string, status: string) => {
    // Se o status já é "maintenance_needed", considerar que precisa de manutenção
    if (status === "maintenance_needed") return true

    const nextDate = new Date(nextMaintenance)
    const today = new Date()
    const diffTime = nextDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  if (!user || user.role !== "admin") {
    return null
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando máquinas...</p>
        </div>
      </div>
    )
  }

  const machinesNeedingMaintenance = machines.filter(
    (machine) => machine.status === "maintenance_needed" || isMaintenanceDue(machine.nextMaintenance, machine.status),
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Máquinas</h1>
        <div className="flex items-center space-x-4">
          <Button onClick={fetchMachines} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          {machinesNeedingMaintenance.length > 0 && (
            <Badge variant="destructive" className="px-3 py-1">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {machinesNeedingMaintenance.length} precisam de manutenção
            </Badge>
          )}
        </div>
      </div>

      {/* Alertas de Manutenção */}
      {machinesNeedingMaintenance.length > 0 && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertas de Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {machinesNeedingMaintenance.map((machine) => (
                <div key={machine.id} className="bg-white p-3 rounded border border-red-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-red-700">{machine.name}</h4>
                      <p className="text-sm text-gray-600">
                        Próxima manutenção: {new Date(machine.nextMaintenance).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-sm text-gray-600">
                        Uso: {machine.hoursUsed.toFixed(1)}h / {machine.maxHours}h (
                        {((machine.hoursUsed / machine.maxHours) * 100).toFixed(1)}%)
                      </p>
                      {machine.notes && <p className="text-sm text-orange-600">{machine.notes}</p>}
                    </div>
                    {getStatusBadge(machine.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Máquinas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.map((machine) => {
          const usagePercentage = (machine.hoursUsed / machine.maxHours) * 100
          const needsMaintenance = isMaintenanceDue(machine.nextMaintenance, machine.status)

          return (
            <Card key={machine.id} className={needsMaintenance ? "border-red-200" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{machine.name}</CardTitle>
                    <p className="text-sm text-gray-600 capitalize">{machine.type}</p>
                    {machine.lastModified && (
                      <p className="text-xs text-gray-500">
                        Modificada: {new Date(machine.lastModified).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(machine.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Instalação</p>
                    <p className="font-semibold">{new Date(machine.installDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Última Manutenção</p>
                    <p className="font-semibold">{new Date(machine.lastMaintenance).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uso</span>
                    <span>
                      {machine.hoursUsed.toFixed(1)}h / {machine.maxHours}h ({usagePercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        usagePercentage > 95 ? "bg-red-500" : usagePercentage > 90 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Próxima Manutenção</p>
                  <p className={`font-semibold ${needsMaintenance ? "text-red-600" : ""}`}>
                    {new Date(machine.nextMaintenance).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                {machine.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Observações</p>
                    <p className="text-sm">{machine.notes}</p>
                  </div>
                )}

                <Button variant="outline" className="w-full" onClick={() => openEditDialog(machine)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Máquina: {editingMachine?.name}</DialogTitle>
          </DialogHeader>
          {editingMachine && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingMachine.status}
                  onValueChange={(value) => {
                    console.log("Status alterado para:", value)
                    setEditingMachine({ ...editingMachine, status: value })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="maintenance_needed">Manutenção Necessária</SelectItem>
                    <SelectItem value="under_maintenance">Em Manutenção</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Status atual: {editingMachine.status}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hoursUsed">Horas Usadas</Label>
                  <Input
                    id="hoursUsed"
                    type="number"
                    step="0.1"
                    value={editingMachine.hoursUsed}
                    onChange={(e) =>
                      setEditingMachine({ ...editingMachine, hoursUsed: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxHours">Horas Máximas</Label>
                  <Input
                    id="maxHours"
                    type="number"
                    value={editingMachine.maxHours}
                    onChange={(e) =>
                      setEditingMachine({ ...editingMachine, maxHours: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="lastMaintenance">Última Manutenção</Label>
                <Input
                  id="lastMaintenance"
                  type="date"
                  value={editingMachine.lastMaintenance}
                  onChange={(e) => setEditingMachine({ ...editingMachine, lastMaintenance: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="nextMaintenance">Próxima Manutenção</Label>
                <Input
                  id="nextMaintenance"
                  type="date"
                  value={editingMachine.nextMaintenance}
                  onChange={(e) => setEditingMachine({ ...editingMachine, nextMaintenance: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={editingMachine.notes}
                  onChange={(e) => setEditingMachine({ ...editingMachine, notes: e.target.value })}
                  placeholder="Adicione observações sobre a máquina..."
                />
              </div>

              <Button onClick={updateMachine} className="w-full" disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
