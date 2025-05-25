"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"

interface ShippingRegion {
  region: string
  name: string
  price: number
}

export default function CartPage() {
  const { state, dispatch } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [shippingCost, setShippingCost] = useState(0)
  const [shippingRegions, setShippingRegions] = useState<ShippingRegion[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchShippingRegions()
  }, [user, router])

  useEffect(() => {
    if (user && shippingRegions.length > 0) {
      const userRegion = shippingRegions.find((region) => region.region === user.address.region)
      if (userRegion) {
        setShippingCost(userRegion.price)
      }
    }
  }, [user, shippingRegions])

  const fetchShippingRegions = async () => {
    try {
      const response = await fetch("/api/shipping")
      const data = await response.json()
      setShippingRegions(data)
    } catch (error) {
      console.error("Erro ao carregar regiões de entrega:", error)
    }
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: "REMOVE_ITEM", payload: id })
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity: newQuantity } })
    }
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const proceedToCheckout = () => {
    router.push("/checkout")
  }

  if (!user) {
    return null
  }

  if (state.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mb-6">Adicione algumas deliciosas pizzas ao seu carrinho!</p>
          <Button onClick={() => router.push("/")}>Ver Cardápio</Button>
        </div>
      </div>
    )
  }

  const total = state.total + shippingCost

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Seu Carrinho</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Image
                    src={item.image || "/placeholder.svg?height=80&width=80"}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    {item.size && <p className="text-sm text-gray-600">Tamanho: {item.size}</p>}
                    {item.flavors && item.flavors.length > 1 && (
                      <p className="text-sm text-gray-600">Sabores: {item.flavors.join(" + ")}</p>
                    )}
                    <p className="font-bold text-red-600">R$ {item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R$ {state.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Entrega para {user.address.region.replace("-", " ")}</span>
                <span>R$ {shippingCost.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button onClick={proceedToCheckout} className="w-full">
                Finalizar Pedido
              </Button>
              <Button variant="outline" onClick={() => router.push("/#cardapio")} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Mais Itens
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Endereço de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {user.address.street}
                <br />
                {user.address.city} - {user.address.zipCode}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
