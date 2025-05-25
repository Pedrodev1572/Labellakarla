"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Flame,
  Crown,
  Star,
  Clock,
  Truck,
  Shield,
  Plus,
  ChefHat,
  PizzaIcon,
  Timer,
  Award,
  Sparkles,
  Heart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
}

interface Complement {
  id: string
  name: string
  category: string
  price: number
  image: string
  available: boolean
}

export default function HomePage() {
  const [featuredPizzas, setFeaturedPizzas] = useState<Pizza[]>([])
  const [complements, setComplements] = useState<Complement[]>([])
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null)
  const [selectedSize, setSelectedSize] = useState<"pequena" | "media" | "grande">("media")
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { dispatch } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchFeaturedPizzas()
    fetchComplements()
  }, [])

  const fetchFeaturedPizzas = async () => {
    try {
      const response = await fetch("/api/pizzas")
      const data = await response.json()
      setFeaturedPizzas(data.slice(0, 3))
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

    const cartItem = {
      id: `${selectedPizza.id}-${selectedSize}-${Date.now()}`,
      type: "pizza" as const,
      name: selectedFlavors.length === 1 ? selectedFlavors[0] : `${selectedFlavors[0]} + ${selectedFlavors[1]}`,
      price: selectedPizza.prices[selectedSize],
      quantity: 1,
      size: selectedSize,
      flavors: selectedFlavors,
      image: selectedPizza.image,
    }

    dispatch({ type: "ADD_ITEM", payload: cartItem })
    setIsDialogOpen(false)
    setSelectedFlavors([])

    toast({
      title: "Pizza adicionada!",
      description: `${cartItem.name} (${selectedSize}) foi adicionada ao carrinho`,
    })

    setTimeout(() => {
      router.push("/cart")
    }, 1000)
  }

  const handleAddPromoToCart = (promoType: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar itens ao carrinho",
        variant: "destructive",
      })
      return
    }

    const coca = complements.find((c) => c.name.includes("Coca-Cola"))
    const pudim = complements.find((c) => c.name.includes("Pudim"))

    if (promoType === "pizza-refri") {
      const cartItems = [
        {
          id: `promo-pizza-${Date.now()}`,
          type: "pizza" as const,
          name: "Pizza Grande (Promoção)",
          price: 49.9,
          quantity: 1,
          size: "grande",
          flavors: ["Margherita"],
          image: featuredPizzas[0]?.image || "/placeholder.svg",
        },
        {
          id: `promo-refri-${Date.now()}`,
          type: "complement" as const,
          name: "Refrigerante 350ml (Promoção)",
          price: 0,
          quantity: 1,
          image: coca?.image || "/placeholder.svg",
        },
      ]

      cartItems.forEach((item) => dispatch({ type: "ADD_ITEM", payload: item }))

      toast({
        title: "Promoção adicionada!",
        description: "Pizza Grande + Refrigerante por R$ 49,90",
      })
    } else if (promoType === "combo-familia") {
      const cartItems = [
        {
          id: `promo-pizza1-${Date.now()}`,
          type: "pizza" as const,
          name: "Pizza Grande 1 (Combo Família)",
          price: 44.95,
          quantity: 1,
          size: "grande",
          flavors: ["Margherita"],
          image: featuredPizzas[0]?.image || "/placeholder.svg",
        },
        {
          id: `promo-pizza2-${Date.now()}`,
          type: "pizza" as const,
          name: "Pizza Grande 2 (Combo Família)",
          price: 44.95,
          quantity: 1,
          size: "grande",
          flavors: ["Pepperoni"],
          image: featuredPizzas[1]?.image || "/placeholder.svg",
        },
        {
          id: `promo-refri1-${Date.now()}`,
          type: "complement" as const,
          name: "Refrigerante 1 (Combo Família)",
          price: 0,
          quantity: 1,
          image: coca?.image || "/placeholder.svg",
        },
        {
          id: `promo-refri2-${Date.now()}`,
          type: "complement" as const,
          name: "Refrigerante 2 (Combo Família)",
          price: 0,
          quantity: 1,
          image: coca?.image || "/placeholder.svg",
        },
        {
          id: `promo-sobremesa-${Date.now()}`,
          type: "complement" as const,
          name: "Sobremesa (Combo Família)",
          price: 0,
          quantity: 1,
          image: pudim?.image || "/placeholder.svg",
        },
      ]

      cartItems.forEach((item) => dispatch({ type: "ADD_ITEM", payload: item }))

      toast({
        title: "Combo Família adicionado!",
        description: "2 Pizzas + 2 Refrigerantes + 1 Sobremesa por R$ 89,90",
      })
    }

    setTimeout(() => {
      router.push("/cart")
    }, 1000)
  }

  const openPizzaDialog = (pizza: Pizza) => {
    setSelectedPizza(pizza)
    setSelectedFlavors([pizza.name])
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

  return (
    <div className="min-h-screen">
      {/* Hero Section - Estilo Pizzaria */}
      <section className="relative bg-gradient-to-br from-red-800 via-red-700 to-orange-600 text-white overflow-hidden min-h-screen flex items-center">
        {/* Pizza Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 animate-spin-slow">
            <PizzaIcon className="h-32 w-32" />
          </div>
          <div className="absolute top-40 right-20 animate-spin-slow delay-1000">
            <PizzaIcon className="h-24 w-24" />
          </div>
          <div className="absolute bottom-20 left-1/4 animate-spin-slow delay-2000">
            <PizzaIcon className="h-28 w-28" />
          </div>
          <div className="absolute bottom-40 right-1/3 animate-spin-slow delay-3000">
            <PizzaIcon className="h-20 w-20" />
          </div>
        </div>

        {/* Floating Pizza Ingredients */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="w-4 h-4 bg-red-500 rounded-full opacity-60 shadow-lg"></div>
        </div>
        <div className="absolute top-32 right-16 animate-bounce delay-500">
          <div className="w-3 h-3 bg-yellow-400 rounded-full opacity-60 shadow-lg"></div>
        </div>
        <div className="absolute bottom-32 left-20 animate-bounce delay-1000">
          <div className="w-5 h-5 bg-green-500 rounded-full opacity-60 shadow-lg"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32 z-10">
          <div className="text-center">
            {/* Badge Pizzaria */}
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-8 py-4 rounded-full font-bold text-lg mb-8 animate-pulse shadow-2xl border-2 border-yellow-300">
              <ChefHat className="h-6 w-6 mr-3" />
              <Sparkles className="h-5 w-5 mr-2" />
              AUTÊNTICA PIZZARIA ITALIANA EM BRASÍLIA
              <Sparkles className="h-5 w-5 ml-2" />
            </div>

            <h1 className="text-6xl lg:text-9xl font-bold mb-8 leading-tight">
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                LA BELLA
              </span>
              <span className="block text-white drop-shadow-2xl">KARLA</span>
            </h1>

            <p className="text-2xl lg:text-4xl mb-12 max-w-5xl mx-auto leading-relaxed font-light">
              <span className="block mb-4 text-yellow-200">
                🔥 Massa artesanal • 🧀 Queijos importados • 🍅 Molho da casa
              </span>
              <span className="text-white font-semibold text-3xl lg:text-5xl bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                A pizza mais saborosa de Brasília!
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16">
              <Link href="/cardapio">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-2xl px-16 py-8 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 border-4 border-yellow-300 hover:shadow-yellow-500/50"
                >
                  <PizzaIcon className="mr-4 h-8 w-8" />
                  PEÇA SUA PIZZA
                  <ArrowRight className="ml-4 h-8 w-8" />
                </Button>
              </Link>
              <Link href="/contato">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-4 border-white text-white hover:bg-white hover:text-red-600 font-bold text-2xl px-16 py-8 rounded-full shadow-2xl backdrop-blur-sm bg-white/10 transform hover:scale-110 transition-all duration-300 hover:shadow-white/50"
                >
                  <Timer className="mr-4 h-8 w-8" />
                  DELIVERY RÁPIDO
                </Button>
              </Link>
            </div>

            {/* Stats Pizzaria Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="text-center bg-black/30 backdrop-blur-md rounded-3xl p-8 border-2 border-yellow-400/50 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/30">
                <div className="text-6xl font-bold text-yellow-400 mb-4 flex items-center justify-center">
                  <PizzaIcon className="h-16 w-16 mr-3" />
                  15+
                </div>
                <div className="text-2xl font-bold text-white">SABORES ÚNICOS</div>
                <div className="text-lg text-yellow-200 mt-2">Receitas tradicionais italianas</div>
              </div>
              <div className="text-center bg-black/30 backdrop-blur-md rounded-3xl p-8 border-2 border-yellow-400/50 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/30">
                <div className="text-6xl font-bold text-yellow-400 mb-4 flex items-center justify-center">
                  <Timer className="h-16 w-16 mr-3" />
                  30min
                </div>
                <div className="text-2xl font-bold text-white">ENTREGA EXPRESSA</div>
                <div className="text-lg text-yellow-200 mt-2">Pizza quentinha na sua casa</div>
              </div>
              <div className="text-center bg-black/30 backdrop-blur-md rounded-3xl p-8 border-2 border-yellow-400/50 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/30">
                <div className="text-6xl font-bold text-yellow-400 mb-4 flex items-center justify-center">
                  <Award className="h-16 w-16 mr-3" />
                  #1
                </div>
                <div className="text-2xl font-bold text-white">MELHOR PIZZARIA</div>
                <div className="text-lg text-yellow-200 mt-2">Eleita pelos brasilienses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-3 border-yellow-400 rounded-full flex justify-center bg-black/20 backdrop-blur-sm">
            <div className="w-2 h-4 bg-yellow-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Promoções Especiais */}
      <section className="py-24 bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-full font-bold text-lg mb-6 animate-pulse shadow-2xl">
              <Flame className="h-6 w-6 mr-2" />
              <Sparkles className="h-5 w-5 mr-2" />
              OFERTAS IMPERDÍVEIS
              <Sparkles className="h-5 w-5 ml-2" />
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              🔥 PROMOÇÕES ESPECIAIS
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Sabores incríveis com preços que cabem no seu bolso!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <Card className="border-4 border-red-300 bg-gradient-to-br from-red-50 to-red-100 relative overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-red-500/30">
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 text-lg font-bold shadow-lg">
                  <Flame className="h-5 w-5 mr-2" />
                  SUPER HOT
                </Badge>
              </div>
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl text-red-700 font-bold">Pizza Grande + Refrigerante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6 mb-6">
                  <Image
                    src="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=100&h=100&fit=crop"
                    alt="Pizza"
                    width={100}
                    height={100}
                    className="rounded-xl shadow-lg border-2 border-red-200"
                  />
                  <div className="text-5xl font-bold text-red-600">+</div>
                  <Image
                    src="https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=100&h=100&fit=crop"
                    alt="Refrigerante"
                    width={100}
                    height={100}
                    className="rounded-xl shadow-lg border-2 border-red-200"
                  />
                </div>
                <p className="text-gray-700 mb-8 text-xl font-medium">Qualquer pizza grande + refrigerante 350ml</p>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl font-bold text-red-600">R$ 49,90</span>
                  <span className="text-2xl text-gray-500 line-through">R$ 65,90</span>
                </div>
                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white mb-6 px-4 py-2 text-lg shadow-lg">
                  <Heart className="h-4 w-4 mr-2" />
                  Economia de R$ 16,00
                </Badge>
                <Button
                  onClick={() => handleAddPromoToCart("pizza-refri")}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xl py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Plus className="h-6 w-6 mr-3" />
                  PEDIR AGORA
                </Button>
              </CardContent>
            </Card>

            <Card className="border-4 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/30">
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 text-lg font-bold shadow-lg">
                  <Crown className="h-5 w-5 mr-2" />
                  FAMÍLIA
                </Badge>
              </div>
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl text-blue-700 font-bold">Combo Família</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center">
                    <Image
                      src="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=80&h=80&fit=crop"
                      alt="Pizza 1"
                      width={80}
                      height={80}
                      className="rounded-xl mx-auto mb-2 shadow-lg border-2 border-blue-200"
                    />
                    <div className="text-sm font-bold">2 Pizzas</div>
                  </div>
                  <div className="text-center">
                    <Image
                      src="https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=80&h=80&fit=crop"
                      alt="Refrigerante"
                      width={80}
                      height={80}
                      className="rounded-xl mx-auto mb-2 shadow-lg border-2 border-blue-200"
                    />
                    <div className="text-sm font-bold">2 Refris</div>
                  </div>
                  <div className="text-center">
                    <Image
                      src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=80&h=80&fit=crop"
                      alt="Sobremesa"
                      width={80}
                      height={80}
                      className="rounded-xl mx-auto mb-2 shadow-lg border-2 border-blue-200"
                    />
                    <div className="text-sm font-bold">1 Sobremesa</div>
                  </div>
                </div>
                <p className="text-gray-700 mb-8 text-xl font-medium">
                  2 pizzas grandes + 2 refrigerantes + 1 sobremesa
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl font-bold text-blue-600">R$ 89,90</span>
                  <span className="text-2xl text-gray-500 line-through">R$ 115,90</span>
                </div>
                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white mb-6 px-4 py-2 text-lg shadow-lg">
                  <Heart className="h-4 w-4 mr-2" />
                  Economia de R$ 26,00
                </Badge>
                <Button
                  onClick={() => handleAddPromoToCart("combo-familia")}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xl py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Plus className="h-6 w-6 mr-3" />
                  PEDIR AGORA
                </Button>
              </CardContent>
            </Card>

            <Card className="border-4 border-green-300 bg-gradient-to-br from-green-50 to-green-100 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-green-500/30">
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl text-green-700 font-bold">Frete Grátis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Truck className="h-12 w-12 text-white" />
                  </div>
                </div>
                <p className="text-gray-700 mb-8 text-xl font-medium">
                  Frete grátis para pedidos acima de R$ 80,00 no Plano Piloto!
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl font-bold text-green-600">R$ 0,00</span>
                  <span className="text-xl text-gray-500">de frete</span>
                </div>
                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white mb-6 px-4 py-2 text-lg shadow-lg">
                  <Clock className="h-4 w-4 mr-2" />
                  Válido até domingo
                </Badge>
                <Link href="/cardapio">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-xl py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <ArrowRight className="h-6 w-6 mr-3" />
                    VER CARDÁPIO
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sabores em Destaque */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-8 py-4 rounded-full font-bold text-lg mb-6 shadow-2xl">
              <Star className="h-6 w-6 mr-2 fill-current" />
              <Sparkles className="h-5 w-5 mr-2" />
              MAIS PEDIDAS
              <Sparkles className="h-5 w-5 ml-2" />
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              ⭐ SABORES EM DESTAQUE
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Os favoritos absolutos dos nossos clientes. Sabores que conquistaram Brasília!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {featuredPizzas.map((pizza, index) => (
              <Card
                key={pizza.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 group border-2 border-gray-200 hover:border-red-300 bg-gradient-to-br from-white to-gray-50"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={pizza.image || "/placeholder.svg"}
                    alt={pizza.name}
                    width={400}
                    height={300}
                    className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-2 text-lg font-bold shadow-lg">
                      <Star className="h-5 w-5 mr-2 fill-current" />#{index + 1} MAIS PEDIDA
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardContent className="p-8">
                  <CardTitle className="text-3xl mb-4 text-gray-900 font-bold">{pizza.name}</CardTitle>
                  <p className="text-gray-600 mb-6 leading-relaxed text-lg">{pizza.description}</p>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="text-4xl font-bold text-red-600">R$ {pizza.prices.media.toFixed(2)}</span>
                      <span className="text-lg text-gray-500 ml-2">(tamanho médio)</span>
                    </div>
                    <div className="flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-full border border-yellow-300">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-bold text-yellow-700 ml-2">4.9</span>
                    </div>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        onClick={() => openPizzaDialog(pizza)}
                      >
                        <Plus className="mr-3 h-6 w-6" />
                        ADICIONAR AO CARRINHO
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
                                <Label htmlFor="pequena">Pequena - R$ {selectedPizza.prices.pequena.toFixed(2)}</Label>
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
                            <Label className="text-base font-semibold">Sabores (máximo 2)</Label>
                            <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                              {featuredPizzas.map((p) => (
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
                            Adicionar ao Carrinho - R$ {selectedPizza.prices[selectedSize].toFixed(2)}
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/cardapio">
              <Button
                size="lg"
                variant="outline"
                className="border-4 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold px-12 py-6 text-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                VER TODOS OS SABORES
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Por que escolher */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Por que escolher a La Bella Karla?
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Mais de 10 anos levando sabor e qualidade para toda Brasília
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Card className="text-center p-10 hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-red-300 bg-gradient-to-br from-white to-red-50 transform hover:-translate-y-2">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Clock className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-3xl mb-6 text-gray-900 font-bold">Entrega Rápida</CardTitle>
              <p className="text-gray-600 leading-relaxed text-lg">
                Entregamos sua pizza quentinha em até 30 minutos. Garantia de frescor e sabor!
              </p>
            </Card>

            <Card className="text-center p-10 hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-green-300 bg-gradient-to-br from-white to-green-50 transform hover:-translate-y-2">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Shield className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-3xl mb-6 text-gray-900 font-bold">Ingredientes Frescos</CardTitle>
              <p className="text-gray-600 leading-relaxed text-lg">
                Selecionamos os melhores ingredientes diariamente. Qualidade que você pode sentir!
              </p>
            </Card>

            <Card className="text-center p-10 hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 bg-gradient-to-br from-white to-blue-50 transform hover:-translate-y-2">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Truck className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-3xl mb-6 text-gray-900 font-bold">Cobertura Total</CardTitle>
              <p className="text-gray-600 leading-relaxed text-lg">
                Atendemos todo o Distrito Federal. Onde você estiver, nossa pizza chega até você!
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="py-24 bg-gradient-to-r from-red-700 via-red-600 to-orange-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <PizzaIcon className="absolute top-10 left-10 h-32 w-32 animate-spin-slow" />
          <PizzaIcon className="absolute bottom-10 right-10 h-28 w-28 animate-spin-slow delay-1000" />
          <Sparkles className="absolute top-20 right-20 h-16 w-16 animate-pulse delay-2000" />
          <Heart className="absolute bottom-20 left-20 h-20 w-20 animate-pulse delay-3000" />
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-8 py-4 rounded-full font-bold text-lg mb-8 animate-bounce shadow-2xl">
            <Sparkles className="h-6 w-6 mr-2" />
            EXPERIÊNCIA ÚNICA
            <Sparkles className="h-6 w-6 ml-2" />
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            Pronto para uma experiência única?
          </h2>
          <p className="text-2xl mb-12 leading-relaxed text-red-100">
            Faça seu pedido agora e descubra por que somos a pizzaria favorita de Brasília!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/cardapio">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-2xl px-12 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-yellow-300 hover:shadow-yellow-500/50"
              >
                <PizzaIcon className="mr-3 h-8 w-8" />
                FAZER PEDIDO AGORA
                <ArrowRight className="ml-3 h-8 w-8" />
              </Button>
            </Link>
            <Link href="/contato">
              <Button
                size="lg"
                variant="outline"
                className="border-4 border-white text-white hover:bg-white hover:text-red-600 font-bold text-2xl px-12 py-6 rounded-full shadow-2xl backdrop-blur-sm bg-white/10 transform hover:scale-105 transition-all duration-300 hover:shadow-white/50"
              >
                <Timer className="mr-3 h-8 w-8" />
                Entre em contato
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
