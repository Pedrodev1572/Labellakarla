"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface Pizza {
  id: string
  name: string
  description: string
  category: string
  ingredients: string[]
  prices: {
    pequena: number
    media: number
    grande: number
  }
  image: string
  available: boolean
}

interface Complement {
  id: string
  name: string
  category: string
  price: number
  image: string
  available: boolean
}

export default function AdminMenuPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [pizzas, setPizzas] = useState<Pizza[]>([])
  const [complements, setComplements] = useState<Complement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingPizza, setEditingPizza] = useState<Pizza | null>(null)
  const [editingComplement, setEditingComplement] = useState<Complement | null>(null)
  const [isPizzaDialogOpen, setIsPizzaDialogOpen] = useState(false)
  const [isComplementDialogOpen, setIsComplementDialogOpen] = useState(false)

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login")
      return
    }
    fetchMenuData()
  }, [user, router])

  const fetchMenuData = async () => {
    try {
      const [pizzasResponse, complementsResponse] = await Promise.all([fetch("/api/pizzas"), fetch("/api/complements")])

      const pizzasData = await pizzasResponse.json()
      const complementsData = await complementsResponse.json()

      setPizzas(pizzasData)
      setComplements(complementsData)
    } catch (error) {
      console.error("Erro ao carregar dados do menu:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do menu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePizza = async () => {
    if (!editingPizza) return

    try {
      const response = await fetch("/api/admin/pizzas", {
        method: editingPizza.id.startsWith("new-") ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPizza),
      })

      if (response.ok) {
        await fetchMenuData()
        setEditingPizza(null)
        setIsPizzaDialogOpen(false)
        toast({
          title: "Sucesso!",
          description: "Pizza salva com sucesso",
        })
      } else {
        throw new Error("Erro ao salvar pizza")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar pizza",
        variant: "destructive",
      })
    }
  }

  const handleSaveComplement = async () => {
    if (!editingComplement) return

    try {
      const response = await fetch("/api/admin/complements", {
        method: editingComplement.id.startsWith("new-") ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingComplement),
      })

      if (response.ok) {
        await fetchMenuData()
        setEditingComplement(null)
        setIsComplementDialogOpen(false)
        toast({
          title: "Sucesso!",
          description: "Complemento salvo com sucesso",
        })
      } else {
        throw new Error("Erro ao salvar complemento")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar complemento",
        variant: "destructive",
      })
    }
  }

  const handleDeletePizza = async (pizzaId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta pizza?")) return

    try {
      const response = await fetch(`/api/admin/pizzas/${pizzaId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchMenuData()
        toast({
          title: "Sucesso!",
          description: "Pizza excluída com sucesso",
        })
      } else {
        throw new Error("Erro ao excluir pizza")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir pizza",
        variant: "destructive",
      })
    }
  }

  const handleDeleteComplement = async (complementId: string) => {
    if (!confirm("Tem certeza que deseja excluir este complemento?")) return

    try {
      const response = await fetch(`/api/admin/complements/${complementId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchMenuData()
        toast({
          title: "Sucesso!",
          description: "Complemento excluído com sucesso",
        })
      } else {
        throw new Error("Erro ao excluir complemento")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir complemento",
        variant: "destructive",
      })
    }
  }

  const openNewPizzaDialog = () => {
    setEditingPizza({
      id: `new-${Date.now()}`,
      name: "",
      description: "",
      category: "tradicional",
      ingredients: [],
      prices: { pequena: 0, media: 0, grande: 0 },
      image: "",
      available: true,
    })
    setIsPizzaDialogOpen(true)
  }

  const openNewComplementDialog = () => {
    setEditingComplement({
      id: `new-${Date.now()}`,
      name: "",
      category: "bebida",
      price: 0,
      image: "",
      available: true,
    })
    setIsComplementDialogOpen(true)
  }

  if (!user || user.role !== "admin") {
    return null
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento do Cardápio</h1>
        <div className="flex space-x-4">
          <Button onClick={openNewPizzaDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Pizza
          </Button>
          <Button onClick={openNewComplementDialog} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Novo Complemento
          </Button>
        </div>
      </div>

      {/* Pizzas */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Pizzas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pizzas.map((pizza) => (
            <Card key={pizza.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <Image
                  src={pizza.image || "/placeholder.svg"}
                  alt={pizza.name}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{pizza.name}</CardTitle>
                  <span
                    className={`px-2 py-1 rounded text-xs ${pizza.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {pizza.available ? "Disponível" : "Indisponível"}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{pizza.description}</p>
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Pequena:</span>
                    <span className="font-medium">R$ {pizza.prices.pequena.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Média:</span>
                    <span className="font-medium">R$ {pizza.prices.media.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Grande:</span>
                    <span className="font-medium">R$ {pizza.prices.grande.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingPizza(pizza)
                      setIsPizzaDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeletePizza(pizza.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Complementos */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Complementos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {complements.map((complement) => (
            <Card key={complement.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <Image
                  src={complement.image || "/placeholder.svg"}
                  alt={complement.name}
                  width={300}
                  height={150}
                  className="w-full h-32 object-cover"
                />
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{complement.name}</CardTitle>
                  <span
                    className={`px-2 py-1 rounded text-xs ${complement.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {complement.available ? "Disponível" : "Indisponível"}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {complement.category === "bebida" ? "Bebida" : "Sobremesa"}
                  </span>
                </div>
                <p className="text-xl font-bold text-red-600 mb-4">R$ {complement.price.toFixed(2)}</p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingComplement(complement)
                      setIsComplementDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteComplement(complement.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog para editar/criar pizza */}
      <Dialog open={isPizzaDialogOpen} onOpenChange={setIsPizzaDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPizza?.id.startsWith("new-") ? "Nova Pizza" : "Editar Pizza"}</DialogTitle>
          </DialogHeader>
          {editingPizza && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={editingPizza.name}
                    onChange={(e) => setEditingPizza({ ...editingPizza, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={editingPizza.category}
                    onValueChange={(value) => setEditingPizza({ ...editingPizza, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tradicional">Tradicional</SelectItem>
                      <SelectItem value="especial">Especial</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={editingPizza.description}
                  onChange={(e) => setEditingPizza({ ...editingPizza, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="image">URL da Imagem</Label>
                <Input
                  id="image"
                  value={editingPizza.image}
                  onChange={(e) => setEditingPizza({ ...editingPizza, image: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price-small">Preço Pequena</Label>
                  <Input
                    id="price-small"
                    type="number"
                    step="0.01"
                    value={editingPizza.prices.pequena}
                    onChange={(e) =>
                      setEditingPizza({
                        ...editingPizza,
                        prices: { ...editingPizza.prices, pequena: Number.parseFloat(e.target.value) },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="price-medium">Preço Média</Label>
                  <Input
                    id="price-medium"
                    type="number"
                    step="0.01"
                    value={editingPizza.prices.media}
                    onChange={(e) =>
                      setEditingPizza({
                        ...editingPizza,
                        prices: { ...editingPizza.prices, media: Number.parseFloat(e.target.value) },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="price-large">Preço Grande</Label>
                  <Input
                    id="price-large"
                    type="number"
                    step="0.01"
                    value={editingPizza.prices.grande}
                    onChange={(e) =>
                      setEditingPizza({
                        ...editingPizza,
                        prices: { ...editingPizza.prices, grande: Number.parseFloat(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={editingPizza.available}
                  onChange={(e) => setEditingPizza({ ...editingPizza, available: e.target.checked })}
                />
                <Label htmlFor="available">Disponível</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsPizzaDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSavePizza}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar/criar complemento */}
      <Dialog open={isComplementDialogOpen} onOpenChange={setIsComplementDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingComplement?.id.startsWith("new-") ? "Novo Complemento" : "Editar Complemento"}
            </DialogTitle>
          </DialogHeader>
          {editingComplement && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="complement-name">Nome</Label>
                <Input
                  id="complement-name"
                  value={editingComplement.name}
                  onChange={(e) => setEditingComplement({ ...editingComplement, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="complement-category">Tipo de Complemento</Label>
                <Select
                  value={editingComplement.category}
                  onValueChange={(value) => setEditingComplement({ ...editingComplement, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bebida">Bebida</SelectItem>
                    <SelectItem value="sobremesa">Sobremesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="complement-price">Preço</Label>
                <Input
                  id="complement-price"
                  type="number"
                  step="0.01"
                  value={editingComplement.price}
                  onChange={(e) =>
                    setEditingComplement({ ...editingComplement, price: Number.parseFloat(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label htmlFor="complement-image">URL da Imagem</Label>
                <Input
                  id="complement-image"
                  value={editingComplement.image}
                  onChange={(e) => setEditingComplement({ ...editingComplement, image: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="complement-available"
                  checked={editingComplement.available}
                  onChange={(e) => setEditingComplement({ ...editingComplement, available: e.target.checked })}
                />
                <Label htmlFor="complement-available">Disponível</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsComplementDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveComplement}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
