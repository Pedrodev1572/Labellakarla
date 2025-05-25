"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Plus, Star, Search, Filter, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

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
  stockAvailable?: boolean
}

interface Complement {
  id: string
  name: string
  category: string
  price: number
  image: string
  available: boolean
}

export default function CardapioPage() {
  const [pizzas, setPizzas] = useState<Pizza[]>([])
  const [complements, setComplements] = useState<Complement[]>([])
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null)
  const [selectedSize, setSelectedSize] = useState<"pequena" | "media" | "grande">("media")
  const [selectedBorder, setSelectedBorder] = useState<"tradicional" | "catupiry" | "cheddar" | "chocolate">(
    "tradicional",
  )
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const { dispatch } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchPizzas()
    fetchComplements()
  }, [])

  const fetchPizzas = async () => {
    try {
      const response = await fetch("/api/pizzas")
      const data = await response.json()
      setPizzas(data)
    } catch (error) {
      console.error("Erro ao carregar pizzas:", error)
    }
  }

  const fetchComplements = async () => {
    try {
      const response = await fetch("/api/complements")
      const data = await response.json()
      setComplements(data)
    } catch (error) {
      console.error("Erro ao carregar complementos:", error)
    }
  }

  const handleAddPizzaToCart = () => {
    if (!selectedPizza || selectedFlavors.length === 0) return

    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar itens ao carrinho",
        variant: "destructive",
      })
      return
    }

    const borderPrices = {
      tradicional: 0,
      catupiry: 8,
      cheddar: 8,
      chocolate: 10,
    }

    const borderNames = {
      tradicional: "",
      catupiry: " + Borda Catupiry",
      cheddar: " + Borda Cheddar",
      chocolate: " + Borda Chocolate",
    }

    const basePrice = selectedPizza.prices[selectedSize]
    const borderPrice = borderPrices[selectedBorder]
    const totalPrice = basePrice + borderPrice

    const cartItem = {
      id: `${selectedPizza.id}-${selectedSize}-${selectedBorder}-${Date.now()}`,
      type: "pizza" as const,
      name:
        (selectedFlavors.length === 1 ? selectedFlavors[0] : `${selectedFlavors[0]} + ${selectedFlavors[1]}`) +
        borderNames[selectedBorder],
      price: totalPrice,
      quantity: 1,
      size: selectedSize,
      flavors: selectedFlavors,
      border: selectedBorder,
      image: selectedPizza.image,
    }

    dispatch({ type: "ADD_ITEM", payload: cartItem })
    setIsDialogOpen(false)
    setSelectedFlavors([])
    setSelectedBorder("tradicional")

    toast({
      title: "Pizza adicionada!",
      description: `${cartItem.name} (${selectedSize}) foi adicionada ao carrinho`,
    })

    router.push("/cart")
  }

  const handleAddComplementToCart = (complement: Complement) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar itens ao carrinho",
        variant: "destructive",
      })
      return
    }

    const cartItem = {
      id: `${complement.id}-${Date.now()}`,
      type: "complement" as const,
      name: complement.name,
      price: complement.price,
      quantity: 1,
      image: complement.image,
    }

    dispatch({ type: "ADD_ITEM", payload: cartItem })

    toast({
      title: "Item adicionado!",
      description: `${complement.name} foi adicionado ao carrinho`,
    })

    // Redirecionamento imediato para o carrinho
    router.push("/cart")
  }

  const openPizzaDialog = (pizza: Pizza) => {
    if (!pizza.available) {
      toast({
        title: "Pizza indisponível",
        description:
          pizza.stockAvailable === false
            ? "Esta pizza está temporariamente indisponível devido à falta de ingredientes"
            : "Esta pizza não está disponível no momento",
        variant: "destructive",
      })
      return
    }

    setSelectedPizza(pizza)
    setSelectedFlavors([pizza.name])
    setSelectedBorder("tradicional")
    setIsDialogOpen(true)
  }

  const handleFlavorChange = (flavor: string, checked: boolean) => {
    if (checked) {
      if (selectedFlavors.length < 2) {
        setSelectedFlavors([...selectedFlavors, flavor])
      }
    } else {
      setSelectedFlavors(selectedFlavors.filter((f) => f !== flavor))
    }
  }

  // Filtros
  const filteredPizzas = pizzas
    .filter((pizza) => {
      const matchesSearch =
        pizza.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pizza.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || pizza.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "price") return a.prices.media - b.prices.media
      return 0
    })

  const beverages = complements.filter((c) => c.category === "bebida")
  const desserts = complements.filter((c) => c.category === "sobremesa")

  // Contar pizzas indisponíveis
  const unavailablePizzas = pizzas.filter((p) => !p.available).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">Nosso Cardápio</h1>
          <p className="text-xl lg:text-2xl max-w-2xl mx-auto">
            Explore todos os nossos sabores únicos e encontre sua pizza perfeita!
          </p>
          {unavailablePizzas > 0 && (
            <div className="mt-4 inline-flex items-center bg-yellow-500 text-black px-4 py-2 rounded-full">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {unavailablePizzas} pizza(s) temporariamente indisponível(is) por falta de ingredientes
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar pizzas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="tradicional">Tradicional</SelectItem>
                <SelectItem value="especial">Especial</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="price">Preço</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600 flex items-center">
              <span className="font-medium">{filteredPizzas.length}</span>
              <span className="ml-1">pizzas encontradas</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="pizzas" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white shadow-md">
            <TabsTrigger value="pizzas" className="text-lg font-semibold">
              Pizzas ({filteredPizzas.length})
            </TabsTrigger>
            <TabsTrigger value="bebidas" className="text-lg font-semibold">
              Bebidas ({beverages.length})
            </TabsTrigger>
            <TabsTrigger value="sobremesas" className="text-lg font-semibold">
              Sobremesas ({desserts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pizzas">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPizzas.map((pizza) => (
                <Card
                  key={pizza.id}
                  className={`overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white ${
                    !pizza.available ? "opacity-60" : ""
                  }`}
                >
                  <CardHeader className="p-0 relative">
                    <Image
                      src={pizza.image || "/placeholder.svg"}
                      alt={pizza.name}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge
                        variant={
                          pizza.category === "especial"
                            ? "default"
                            : pizza.category === "premium"
                              ? "destructive"
                              : "secondary"
                        }
                        className="font-semibold"
                      >
                        {pizza.category}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      {!pizza.available ? (
                        <Badge variant="destructive" className="bg-red-600">
                          {pizza.stockAvailable === false ? "Sem Ingredientes" : "Indisponível"}
                        </Badge>
                      ) : (
                        <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold text-gray-700 ml-1">4.8</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-xl mb-3">{pizza.name}</CardTitle>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{pizza.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Pequena</span>
                        <span className="font-semibold text-gray-700">R$ {pizza.prices.pequena.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Média</span>
                        <span className="font-semibold text-gray-700">R$ {pizza.prices.media.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Grande</span>
                        <span className="font-semibold text-gray-700">R$ {pizza.prices.grande.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className={`w-full font-semibold ${
                            pizza.available ? "bg-red-600 hover:bg-red-700" : "bg-gray-400 cursor-not-allowed"
                          }`}
                          onClick={() => openPizzaDialog(pizza)}
                          disabled={!pizza.available}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {pizza.available ? "Adicionar ao Carrinho" : "Indisponível"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Personalizar Pizza</DialogTitle>
                        </DialogHeader>
                        {selectedPizza && (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-base font-semibold">Tamanho</Label>
                              <RadioGroup value={selectedSize} onValueChange={(value: any) => setSelectedSize(value)}>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="pequena" id="pequena" />
                                  <Label htmlFor="pequena">
                                    Pequena - R$ {selectedPizza.prices.pequena.toFixed(2)}
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="media" id="media" />
                                  <Label htmlFor="media">Média - R$ {selectedPizza.prices.media.toFixed(2)}</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="grande" id="grande" />
                                  <Label htmlFor="grande">Grande - R$ {selectedPizza.prices.grande.toFixed(2)}</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            <div>
                              <Label className="text-base font-semibold">Borda</Label>
                              <RadioGroup
                                value={selectedBorder}
                                onValueChange={(value: any) => setSelectedBorder(value)}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="tradicional" id="tradicional" />
                                  <Label htmlFor="tradicional">Tradicional - Grátis</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="catupiry" id="catupiry" />
                                  <Label htmlFor="catupiry">Borda Recheada Catupiry - R$ 8,00</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="cheddar" id="cheddar" />
                                  <Label htmlFor="cheddar">Borda Recheada Cheddar - R$ 8,00</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="chocolate" id="chocolate" />
                                  <Label htmlFor="chocolate">Borda Recheada Chocolate - R$ 10,00</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            <div>
                              <Label className="text-base font-semibold">Sabores (máximo 2)</Label>
                              <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                                {pizzas
                                  .filter((p) => p.available)
                                  .map((p) => (
                                    <div key={p.id} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={p.name}
                                        checked={selectedFlavors.includes(p.name)}
                                        onChange={(e) => handleFlavorChange(p.name, e.target.checked)}
                                        disabled={!selectedFlavors.includes(p.name) && selectedFlavors.length >= 2}
                                        className="rounded"
                                      />
                                      <Label htmlFor={p.name} className="text-sm">
                                        {p.name}
                                      </Label>
                                    </div>
                                  ))}
                              </div>
                            </div>

                            <Button
                              onClick={handleAddPizzaToCart}
                              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
                              disabled={selectedFlavors.length === 0}
                            >
                              Adicionar ao Carrinho - R${" "}
                              {(
                                selectedPizza.prices[selectedSize] +
                                (selectedBorder === "tradicional" ? 0 : selectedBorder === "chocolate" ? 10 : 8)
                              ).toFixed(2)}
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bebidas">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {beverages.map((beverage) => (
                <Card key={beverage.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                  <CardHeader className="p-0">
                    <Image
                      src={beverage.image || "/placeholder.svg"}
                      alt={beverage.name}
                      width={300}
                      height={200}
                      className="w-full h-32 object-cover"
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2">{beverage.name}</CardTitle>
                    <p className="text-2xl font-bold text-red-600">R$ {beverage.price.toFixed(2)}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      onClick={() => handleAddComplementToCart(beverage)}
                      className="w-full"
                      disabled={!beverage.available}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {beverage.available ? "Adicionar" : "Indisponível"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sobremesas">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {desserts.map((dessert) => (
                <Card key={dessert.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                  <CardHeader className="p-0">
                    <Image
                      src={dessert.image || "/placeholder.svg"}
                      alt={dessert.name}
                      width={300}
                      height={200}
                      className="w-full h-32 object-cover"
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2">{dessert.name}</CardTitle>
                    <p className="text-2xl font-bold text-red-600">R$ {dessert.price.toFixed(2)}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      onClick={() => handleAddComplementToCart(dessert)}
                      className="w-full"
                      disabled={!dessert.available}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {dessert.available ? "Adicionar" : "Indisponível"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
