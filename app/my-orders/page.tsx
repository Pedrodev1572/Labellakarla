"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock, CheckCircle, Truck, Package, Eye, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
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
  pending: {
    label: "Pendente",
    icon: Clock,
    color: "bg-yellow-500",
    description: "Seu pedido foi recebido e está sendo processado",
  },
  confirmed: {
    label: "Confirmado",
    icon: CheckCircle,
    color: "bg-blue-500",
    description: "Pedido confirmado e será preparado em breve",
  },
  preparing: {
    label: "Preparando",
    icon: Package,
    color: "bg-orange-500",
    description: "Sua pizza está sendo preparada com carinho",
  },
  delivering: { label: "A Caminho", icon: Truck, color: "bg-purple-500", description: "Pedido saiu para entrega" },
  delivered: {
    label: "Entregue",
    icon: CheckCircle,
    color: "bg-green-500",
    description: "Pedido entregue com sucesso",
  },
}

export default function MyOrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchMyOrders()

    // Atualização automática a cada 15 segundos para acompanhar status
    const interval = setInterval(() => {
      fetchMyOrders()
    }, 15000)

    return () => clearInterval(interval)
  }, [user, router])

  const fetchMyOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      const data = await response.json()
      // Filtrar apenas os pedidos do usuário logado
      const userOrders = data.filter((order: Order) => order.userId === user?.id)
      setOrders(
        userOrders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      )
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar seus pedidos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getEstimatedTime = (status: string, createdAt: string) => {
    const orderTime = new Date(createdAt)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60))

    switch (status) {
      case "pending":
      case "confirmed":
        return "5-10 minutos para começar o preparo"
      case "preparing":
        return "15-20 minutos para ficar pronto"
      case "delivering":
        return "20-30 minutos para entrega"
      case "delivered":
        return "Entregue"
      default:
        return "Tempo não disponível"
    }
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando seus pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
        <Button onClick={fetchMyOrders} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-600 mb-4">Você ainda não fez nenhum pedido conosco.</p>
            <Button onClick={() => router.push("/cardapio")}>Fazer Primeiro Pedido</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock
            const statusInfo = statusConfig[order.status as keyof typeof statusConfig]

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Pedido #{order.id}</h3>
                      <p className="text-gray-600">{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">R$ {order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 mb-4">
                    <StatusIcon className="h-6 w-6" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
                        {order.status !== "delivered" && (
                          <span className="text-sm text-gray-600">
                            • {getEstimatedTime(order.status, order.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{statusInfo?.description}</p>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                      <span>Pedido Feito</span>
                      <span>Preparando</span>
                      <span>A Caminho</span>
                      <span>Entregue</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width:
                            order.status === "pending"
                              ? "25%"
                              : order.status === "confirmed"
                                ? "25%"
                                : order.status === "preparing"
                                  ? "50%"
                                  : order.status === "delivering"
                                    ? "75%"
                                    : order.status === "delivered"
                                      ? "100%"
                                      : "0%",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Entrega para:</p>
                      <p className="font-medium">{order.customerAddress.street}</p>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => setSelectedOrder(order)}>
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
                            <div className="flex items-center space-x-3">
                              <StatusIcon className="h-6 w-6" />
                              <div>
                                <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
                                <p className="text-sm text-gray-600 mt-1">{statusInfo?.description}</p>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="font-semibold mb-3">Itens do Pedido</h4>
                              <div className="space-y-3">
                                {selectedOrder.items.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                    <div>
                                      <p className="font-medium">{item.name}</p>
                                      {item.size && <p className="text-sm text-gray-600">Tamanho: {item.size}</p>}
                                      {item.flavors && item.flavors.length > 1 && (
                                        <p className="text-sm text-gray-600">Sabores: {item.flavors.join(" + ")}</p>
                                      )}
                                      <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="font-semibold mb-3">Endereço de Entrega</h4>
                              <div className="bg-gray-50 p-3 rounded">
                                <p>{selectedOrder.customerAddress.street}</p>
                                <p>
                                  {selectedOrder.customerAddress.city} - {selectedOrder.customerAddress.zipCode}
                                </p>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>R$ {selectedOrder.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Taxa de Entrega:</span>
                                <span>R$ {selectedOrder.shippingCost.toFixed(2)}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>R$ {selectedOrder.total.toFixed(2)}</span>
                              </div>
                            </div>

                            <div className="text-center text-sm text-gray-600">
                              <p>Pedido realizado em {new Date(selectedOrder.createdAt).toLocaleString("pt-BR")}</p>
                              {selectedOrder.updatedAt !== selectedOrder.createdAt && (
                                <p>Última atualização: {new Date(selectedOrder.updatedAt).toLocaleString("pt-BR")}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
