"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, MapPin, User, Calculator, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface AddressData {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  numero: string
  complementoExtra: string
}

export default function CheckoutPage() {
  const { state, dispatch } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [isLoading, setIsLoading] = useState(false)
  const [shippingCost, setShippingCost] = useState(0)
  const [shippingRegion, setShippingRegion] = useState("")
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)

  const [addressData, setAddressData] = useState<AddressData>({
    cep: "",
    logradouro: "",
    complemento: "",
    bairro: "",
    localidade: "",
    uf: "",
    numero: "",
    complementoExtra: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (state.items.length === 0) {
      router.push("/cart")
      return
    }

    // Carregar endereço salvo do usuário
    if (user.address.zipCode) {
      setAddressData({
        cep: user.address.zipCode,
        logradouro: user.address.street.split(",")[0] || "",
        complemento: "",
        bairro: user.address.region.replace("-", " "),
        localidade: user.address.city,
        uf: "DF",
        numero: user.address.street.split(",")[1]?.trim() || "",
        complementoExtra: user.address.street.split(",")[2]?.trim() || "",
      })
      calculateShippingByCep(user.address.zipCode, user.address.region.replace("-", " "))
    }
  }, [user, state.items, router])

  const searchCep = async (cep: string) => {
    if (!cep || cep.replace(/\D/g, "").length !== 8) return

    setIsLoadingCep(true)
    try {
      const cleanCep = cep.replace(/\D/g, "")
      const response = await fetch(`/api/cep/${cleanCep}`)
      const data = await response.json()

      if (response.ok) {
        setAddressData({
          ...addressData,
          cep: data.cep,
          logradouro: data.logradouro || "",
          complemento: data.complemento || "",
          bairro: data.bairro || "",
          localidade: data.localidade || "",
          uf: data.uf || "",
        })

        // Calcular frete automaticamente
        await calculateShippingByCep(cleanCep, data.bairro)

        toast({
          title: "CEP encontrado!",
          description: `Endereço: ${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`,
        })
      } else {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP informado",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao buscar CEP",
        description: "Tente novamente",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCep(false)
    }
  }

  const calculateShippingByCep = async (cep: string, bairro?: string) => {
    if (!cep || cep.length < 8) return

    setIsCalculatingShipping(true)
    try {
      const response = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep, bairro }),
      })

      const data = await response.json()

      if (response.ok) {
        setShippingCost(data.price)
        setShippingRegion(data.name)
        toast({
          title: "Frete calculado!",
          description: `Entrega para ${data.name}: R$ ${data.price.toFixed(2)}`,
        })
      } else {
        setShippingCost(0)
        setShippingRegion("")
        toast({
          title: "CEP não atendido",
          description: data.message || "Não entregamos nesta região",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao calcular frete",
        description: "Tente novamente",
        variant: "destructive",
      })
    } finally {
      setIsCalculatingShipping(false)
    }
  }

  const handleCepChange = (cep: string) => {
    setAddressData({ ...addressData, cep })
    if (cep.replace(/\D/g, "").length === 8) {
      searchCep(cep)
    }
  }

  const handlePlaceOrder = async () => {
    if (!user) return

    if (!addressData.cep || addressData.cep.replace(/\D/g, "").length !== 8) {
      toast({
        title: "CEP obrigatório",
        description: "Informe um CEP válido",
        variant: "destructive",
      })
      return
    }

    if (!addressData.numero) {
      toast({
        title: "Número obrigatório",
        description: "Informe o número da residência",
        variant: "destructive",
      })
      return
    }

    if (shippingCost === 0 && !shippingRegion) {
      toast({
        title: "Calcule o frete",
        description: "É necessário calcular o frete antes de finalizar",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const fullAddress = `${addressData.logradouro}, ${addressData.numero}${
        addressData.complementoExtra ? `, ${addressData.complementoExtra}` : ""
      }`

      const orderData = {
        userId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        customerAddress: {
          street: fullAddress,
          region: addressData.bairro,
          city: addressData.localidade,
          zipCode: addressData.cep,
        },
        items: state.items,
        subtotal: state.total,
        shippingCost,
        total: state.total + shippingCost,
        paymentMethod,
        status: "pending",
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (response.ok) {
        dispatch({ type: "CLEAR_CART" })
        toast({
          title: "Pedido realizado com sucesso!",
          description: `Seu pedido #${data.order.id} foi confirmado.`,
        })
        router.push(`/order-confirmation/${data.order.id}`)
      } else {
        toast({
          title: "Erro ao realizar pedido",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao realizar pedido",
        description: "Erro interno do servidor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || state.items.length === 0) {
    return null
  }

  const total = state.total + shippingCost

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Nome:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Telefone:</strong> {user.phone}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Endereço de Entrega
                </div>
                {!editingAddress && addressData.logradouro && (
                  <Button variant="outline" size="sm" onClick={() => setEditingAddress(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!editingAddress && addressData.logradouro ? (
                // Mostrar endereço salvo
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">
                    {addressData.logradouro}
                    {addressData.numero && `, ${addressData.numero}`}
                    {addressData.complementoExtra && `, ${addressData.complementoExtra}`}
                  </p>
                  <p className="text-gray-600">
                    {addressData.bairro} - {addressData.localidade}/{addressData.uf}
                  </p>
                  <p className="text-gray-600">CEP: {addressData.cep}</p>
                  {shippingRegion && (
                    <p className="text-green-600 font-medium mt-2">
                      Frete: R$ {shippingCost.toFixed(2)} ({shippingRegion})
                    </p>
                  )}
                </div>
              ) : (
                // Formulário de endereço
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cep"
                        value={addressData.cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                        disabled={isLoadingCep}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => searchCep(addressData.cep)}
                        disabled={isLoadingCep || addressData.cep.replace(/\D/g, "").length !== 8}
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                    {isLoadingCep && <p className="text-sm text-gray-600 mt-1">Buscando CEP...</p>}
                  </div>

                  {addressData.logradouro && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="logradouro">Logradouro</Label>
                          <Input
                            id="logradouro"
                            value={addressData.logradouro}
                            onChange={(e) => setAddressData({ ...addressData, logradouro: e.target.value })}
                            placeholder="Rua, Avenida..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="numero">Número *</Label>
                          <Input
                            id="numero"
                            value={addressData.numero}
                            onChange={(e) => setAddressData({ ...addressData, numero: e.target.value })}
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="complementoExtra">Complemento</Label>
                        <Input
                          id="complementoExtra"
                          value={addressData.complementoExtra}
                          onChange={(e) => setAddressData({ ...addressData, complementoExtra: e.target.value })}
                          placeholder="Apartamento, bloco, etc."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bairro">Bairro</Label>
                          <Input
                            id="bairro"
                            value={addressData.bairro}
                            onChange={(e) => setAddressData({ ...addressData, bairro: e.target.value })}
                            placeholder="Bairro"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cidade">Cidade</Label>
                          <Input
                            id="cidade"
                            value={addressData.localidade}
                            onChange={(e) => setAddressData({ ...addressData, localidade: e.target.value })}
                            placeholder="Cidade"
                          />
                        </div>
                      </div>

                      {isCalculatingShipping && <p className="text-sm text-gray-600">Calculando frete...</p>}
                      {shippingRegion && (
                        <p className="text-sm text-green-600">
                          Região: {shippingRegion} - Frete: R$ {shippingCost.toFixed(2)}
                        </p>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingAddress(false)}
                        className="w-full"
                      >
                        Confirmar Endereço
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Forma de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <Label htmlFor="credit-card">Cartão de Crédito</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="debit-card" id="debit-card" />
                  <Label htmlFor="debit-card">Cartão de Débito</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label htmlFor="pix">PIX</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Dinheiro na Entrega</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {state.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.size && <p className="text-gray-600">Tamanho: {item.size}</p>}
                      <p className="text-gray-600">Qtd: {item.quantity}</p>
                    </div>
                    <p className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {state.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Entrega</span>
                  <span>{shippingCost > 0 ? `R$ ${shippingCost.toFixed(2)}` : "Calcular"}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                className="w-full mt-6"
                disabled={isLoading || !shippingRegion || !addressData.numero}
              >
                {isLoading ? "Processando..." : `Confirmar Pedido - R$ ${total.toFixed(2)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
