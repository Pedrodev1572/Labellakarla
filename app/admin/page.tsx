"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package, ShoppingCart, Settings, TrendingUp, AlertTriangle, Clock, Wrench, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useAdmin } from "@/contexts/admin-context"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const { user } = useAuth()
  const { lastUpdate, setPendingOrders, triggerUpdate } = useAdmin()
  const { toast } = useToast()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    machinesNeedingMaintenance: 0,
    unavailablePizzas: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [lowStockIngredients, setLowStockIngredients] = useState([])
  const [maintenanceAlerts, setMaintenanceAlerts] = useState([])
  const [unavailablePizzas, setUnavailablePizzas] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login")
      return
    }

    fetchDashboardData()
  }, [user, router, lastUpdate])

  useEffect(() => {
    if (!user || user.role !== "admin") return

    // Verificar manutenção das máquinas a cada inicialização
    checkMachinesMaintenance()

    // Atualização automática a cada 30 segundos
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000)

    return () => clearInterval(interval)
  }, [user])

  const checkMachinesMaintenance = async () => {
    try {
      await fetch("/api/machines/maintenance", { method: "POST" })
    } catch (error) {
      console.error("Erro ao verificar manutenção:", error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const ordersResponse = await fetch("/api/orders")
      const orders = await ordersResponse.json()

      // Fetch ingredients
      const ingredientsResponse = await fetch("/api/ingredients")
      const ingredients = await ingredientsResponse.json()

      // Fetch machines
      const machinesResponse = await fetch("/api/machines")
      const machines = await machinesResponse.json()

      // Fetch pizzas para verificar disponibilidade
      const pizzasResponse = await fetch("/api/pizzas")
      const pizzas = await pizzasResponse.json()

      // Calculate stats
      const totalOrders = orders.length
      const pendingOrders = orders.filter(
        (order: any) => order.status === "pending" || order.status === "confirmed",
      ).length
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0)
      const lowStock = ingredients.filter((ingredient: any) => ingredient.stock <= ingredient.minStock)

      // Máquinas que precisam de manutenção (apenas status maintenance_needed)
      const machinesNeedingMaintenance = machines.filter((machine: any) => {
        return machine.status === "maintenance_needed"
      })

      // Pizzas indisponíveis por falta de estoque
      const unavailablePizzas = pizzas.filter((pizza: any) => !pizza.available && pizza.stockAvailable === false)

      console.log("Dashboard stats:", {
        totalOrders,
        pendingOrders,
        totalRevenue,
        lowStockItems: lowStock.length,
        machinesNeedingMaintenance: machinesNeedingMaintenance.length,
        unavailablePizzas: unavailablePizzas.length,
      })

      setStats({
        totalOrders,
        pendingOrders,
        totalRevenue,
        lowStockItems: lowStock.length,
        machinesNeedingMaintenance: machinesNeedingMaintenance.length,
        unavailablePizzas: unavailablePizzas.length,
      })

      setPendingOrders(pendingOrders)
      setRecentOrders(orders.slice(0, 5))
      setLowStockIngredients(lowStock)
      setMaintenanceAlerts(machinesNeedingMaintenance)
      setUnavailablePizzas(unavailablePizzas)
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchDashboardData()
      triggerUpdate() // Notificar outras páginas
      toast({
        title: "Dados atualizados!",
        description: "Todas as informações foram atualizadas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Erro ao atualizar os dados do dashboard.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600">Bem-vindo, {user.name}</p>
          <p className="text-sm text-gray-500">Última atualização: {new Date(lastUpdate).toLocaleTimeString()}</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Atualizando..." : "Atualizar Tudo"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStockItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenção</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.machinesNeedingMaintenance}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pizzas Indisponíveis</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.unavailablePizzas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Button onClick={() => router.push("/admin/orders")} className="h-20 flex flex-col">
          <ShoppingCart className="h-6 w-6 mb-2" />
          Gerenciar Pedidos
          {stats.pendingOrders > 0 && (
            <Badge className="mt-1 bg-yellow-500 text-black">{stats.pendingOrders} pendentes</Badge>
          )}
        </Button>
        <Button onClick={() => router.push("/admin/menu")} variant="outline" className="h-20 flex flex-col">
          <Package className="h-6 w-6 mb-2" />
          Gerenciar Cardápio
          {stats.unavailablePizzas > 0 && (
            <Badge className="mt-1 bg-purple-500 text-white">{stats.unavailablePizzas} indisponíveis</Badge>
          )}
        </Button>
        <Button onClick={() => router.push("/admin/ingredients")} variant="outline" className="h-20 flex flex-col">
          <Settings className="h-6 w-6 mb-2" />
          Controle de Estoque
          {stats.lowStockItems > 0 && <Badge className="mt-1 bg-red-500 text-white">{stats.lowStockItems} baixo</Badge>}
        </Button>
        <Button onClick={() => router.push("/admin/machines")} variant="outline" className="h-20 flex flex-col">
          <Wrench className="h-6 w-6 mb-2" />
          Gerenciar Máquinas
          {stats.machinesNeedingMaintenance > 0 && (
            <Badge className="mt-1 bg-orange-500 text-white">{stats.machinesNeedingMaintenance} alertas</Badge>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-gray-600 text-center py-4">Nenhum pedido encontrado</p>
              ) : (
                recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">#{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                      <p className="text-sm text-gray-600">R$ {order.total.toFixed(2)}</p>
                    </div>
                    <Badge
                      variant={
                        order.status === "pending"
                          ? "secondary"
                          : order.status === "confirmed"
                            ? "default"
                            : order.status === "preparing"
                              ? "secondary"
                              : order.status === "delivering"
                                ? "default"
                                : "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockIngredients.length === 0 ? (
                <p className="text-gray-600">Todos os ingredientes estão com estoque adequado!</p>
              ) : (
                lowStockIngredients.map((ingredient: any) => (
                  <div
                    key={ingredient.id}
                    className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50"
                  >
                    <div>
                      <p className="font-medium">{ingredient.name}</p>
                      <p className="text-sm text-gray-600">
                        Estoque atual: {ingredient.stock} {ingredient.unit}
                      </p>
                      <p className="text-sm text-red-600">
                        Mínimo: {ingredient.minStock} {ingredient.unit}
                      </p>
                    </div>
                    <Badge variant="destructive">Baixo</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-orange-500" />
              Alertas de Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceAlerts.length === 0 ? (
                <p className="text-gray-600">Todas as máquinas estão funcionando bem!</p>
              ) : (
                maintenanceAlerts.map((machine: any) => (
                  <div
                    key={machine.id}
                    className="flex items-center justify-between p-3 border rounded-lg border-orange-200 bg-orange-50"
                  >
                    <div>
                      <p className="font-medium">{machine.name}</p>
                      <p className="text-sm text-gray-600">
                        Próxima manutenção: {new Date(machine.nextMaintenance).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-sm text-orange-600">{machine.notes}</p>
                    </div>
                    <Badge variant="secondary" className="bg-orange-500 text-white">
                      Urgente
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Unavailable Pizzas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-purple-500" />
              Pizzas Indisponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unavailablePizzas.length === 0 ? (
                <p className="text-gray-600">Todas as pizzas estão disponíveis!</p>
              ) : (
                unavailablePizzas.map((pizza: any) => (
                  <div
                    key={pizza.id}
                    className="flex items-center justify-between p-3 border rounded-lg border-purple-200 bg-purple-50"
                  >
                    <div>
                      <p className="font-medium">{pizza.name}</p>
                      <p className="text-sm text-gray-600">Falta de ingredientes</p>
                    </div>
                    <Badge variant="secondary" className="bg-purple-500 text-white">
                      Indisponível
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
