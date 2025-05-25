"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { CheckCircle, Clock, Truck, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Order {
  id: string
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
}

const statusConfig = {
  pending: { label: "Pendente", icon: Clock, color: "bg-yellow-500" },
  confirmed: { label: "Confirmado", icon: CheckCircle, color: "bg-blue-500" },
  preparing: { label: "Preparando", icon: Package, color: "bg-orange-500" },
  delivering: { label: "A Caminho", icon: Truck, color: "bg-purple-500" },
  delivered: { label: "Entregue", icon: CheckCircle, color: "bg-green-500" },
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      }
    } catch (error) {
      console.error("Erro ao carregar pedido:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pedido não encontrado</h2>
          <Button onClick={() => router.push("/")}>Voltar ao Início</Button>
        </div>
      </div>
    )
  }

  const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido Confirmado!</h1>
        <p className="text-gray-600">Obrigado por escolher a Pizzaria Delícia</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Número do Pedido</p>
                  <p className="font-bold text-lg">#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data do Pedido</p>
                  <p>{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusIcon className="h-5 w-5" />
                  <Badge className={statusConfig[order.status as keyof typeof statusConfig]?.color}>
                    {statusConfig[order.status as keyof typeof statusConfig]?.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{order.customerName}</p>
                <p>{order.customerAddress.street}</p>
                <p>
                  {order.customerAddress.city} - {order.customerAddress.zipCode}
                </p>
                <p className="text-sm text-gray-600">Telefone: {order.customerPhone}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.size && <p className="text-sm text-gray-600">Tamanho: {item.size}</p>}
                    {item.flavors && item.flavors.length > 1 && (
                      <p className="text-sm text-gray-600">Sabores: {item.flavors.join(" + ")}</p>
                    )}
                    <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
                  </div>
                  <p className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Entrega</span>
                  <span>R$ {order.shippingCost.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>R$ {order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-4">
            <Button onClick={() => router.push("/")} className="w-full">
              Fazer Novo Pedido
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="w-full">
              Imprimir Comprovante
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
