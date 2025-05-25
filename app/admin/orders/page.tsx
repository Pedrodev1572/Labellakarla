"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock, CheckCircle, Truck, Package, Eye, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useAdmin } from "@/contexts/admin-context"
import { useToast } from "@/hooks/use-toast"

interface Order {
  id: string
  userId: string
  customerName: string
  customerPhone: string
  customerAddress: {
    street: string
    region: string
    city: string
    zipCode: string
  }
  items: Array<{
    id: string
    type: string
    name: string
    price: number
    quantity: number
    size?: string
    flavors?: string[]
  }>
  subtotal: number
  shippingCost: number
  total: number
  status: string
  createdAt: string
  updatedAt: string
}

const statusConfig = {
  pending: { label: "Pendente", icon: Clock, color: "bg-yellow-500" },
  confirmed: { label: "Confirmado", icon: CheckCircle, color: "bg-blue-500" },
  preparing: { label: "Preparando", icon: Package, color: "bg-orange-500" },
  delivering: { label: "A Caminho", icon: Truck, color: "bg-purple-500" },
  delivered: { label: "Entregue", icon: CheckCircle, color: "bg-green-500" },
}

export default function AdminOrdersPage() {
  const { user } = useAuth()
  const { triggerUpdate } = useAdmin()
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login")
      return
    }

    fetchOrders()

    // Atualização automática a cada 10 segundos
    const interval = setInterval(() => {
      fetchOrders()
    }, 10000)

    return () => clearInterval(interval)
  }, [user, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      const data = await response.json()
      setOrders(data.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar pedidos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Atualizar imediatamente após mudança
        await fetchOrders()
        // Notificar outras páginas admin
        triggerUpdate()
        toast({
          title: "Status atualizado!",
          description: `Pedido #${orderId} atualizado para ${statusConfig[newStatus as keyof typeof statusConfig]?.label}`,
        })
      } else {
        throw new Error("Erro ao atualizar status")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do pedido",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (!user || user.role !== "admin") {
    return null
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Pedidos</h1>
        <Button onClick={fetchOrders} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = orders.filter((order) => order.status === status).length
          const StatusIcon = config.icon
          return (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{config.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <StatusIcon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum pedido encontrado</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => {
            const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                    <div>
                      <h3 className="font-semibold text-lg">Pedido #{order.id}</h3>
                      <p className="text-gray-600">{order.customerName}</p>
                      <p className="text-sm text-gray-500">{order.customerPhone}</p>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Itens:</p>
                      <p className="font-medium">{order.items.length} item(s)</p>
                      <p className="text-sm text-gray-600">Total: R$ {order.total.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <StatusIcon className="h-5 w-5" />
                      <Badge className={statusConfig[order.status as keyof typeof statusConfig]?.color}>
                        {statusConfig[order.status as keyof typeof statusConfig]?.label}
                      </Badge>
                    </div>

                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Pedido #{order.id}</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Cliente</h4>
                                  <p>{selectedOrder.customerName}</p>
                                  <p>{selectedOrder.customerPhone}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Endereço</h4>
                                  <p>{selectedOrder.customerAddress.street}</p>
                                  <p>
                                    {selectedOrder.customerAddress.city} - {selectedOrder.customerAddress.zipCode}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Itens do Pedido</h4>
                                <div className="space-y-2">
                                  {selectedOrder.items.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                    >
                                      <div>
                                        <p className="font-medium">{item.name}</p>
                                        {item.size && <p className="text-sm text-gray-600">Tamanho: {item.size}</p>}
                                        <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
                                      </div>
                                      <p className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="border-t pt-4">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span>R$ {selectedOrder.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Frete:</span>
                                  <span>R$ {selectedOrder.shippingCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                  <span>Total:</span>
                                  <span>R$ {selectedOrder.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="confirmed">Confirmado</SelectItem>
                          <SelectItem value="preparing">Preparando</SelectItem>
                          <SelectItem value="delivering">A Caminho</SelectItem>
                          <SelectItem value="delivered">Entregue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
