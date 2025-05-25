"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Plus, Minus, Save, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface Ingredient {
  id: string
  name: string
  stock: number
  unit: string
  minStock: number
  lastUpdated: string
}

export default function AdminIngredientsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingStock, setUpdatingStock] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login")
      return
    }

    fetchIngredients()

    // Atualização automática a cada 60 segundos
    const interval = setInterval(() => {
      fetchIngredients()
    }, 60000)

    return () => clearInterval(interval)
  }, [user, router])

  const fetchIngredients = async () => {
    try {
      const response = await fetch("/api/ingredients")
      const data = await response.json()
      setIngredients(data)
    } catch (error) {
      console.error("Erro ao carregar ingredientes:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar ingredientes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateStock = async (ingredientId: string, newStock: number) => {
    try {
      const response = await fetch("/api/ingredients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ingredientId, stock: newStock }),
      })

      if (response.ok) {
        // Atualizar imediatamente após mudança
        await fetchIngredients()
        toast({
          title: "Estoque atualizado!",
          description: "Estoque do ingrediente foi atualizado com sucesso",
        })
      } else {
        throw new Error("Erro ao atualizar estoque")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar estoque",
        variant: "destructive",
      })
    }
  }

  const handleStockChange = (ingredientId: string, value: number) => {
    setUpdatingStock({ ...updatingStock, [ingredientId]: value })
  }

  const saveStockChange = (ingredientId: string) => {
    const newStock = updatingStock[ingredientId]
    if (newStock !== undefined) {
      updateStock(ingredientId, newStock)
      const { [ingredientId]: _, ...rest } = updatingStock
      setUpdatingStock(rest)
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
          <p>Carregando ingredientes...</p>
        </div>
      </div>
    )
  }

  const lowStockIngredients = ingredients.filter((ingredient) => ingredient.stock <= ingredient.minStock)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Controle de Estoque</h1>
        <div className="flex items-center space-x-4">
          <Button onClick={fetchIngredients} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          {lowStockIngredients.length > 0 && (
            <Badge variant="destructive" className="px-3 py-1">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {lowStockIngredients.length} em falta
            </Badge>
          )}
        </div>
      </div>

      {/* Alertas de Estoque Baixo */}
      {lowStockIngredients.length > 0 && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertas de Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockIngredients.map((ingredient) => (
                <div key={ingredient.id} className="bg-white p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-700">{ingredient.name}</h4>
                  <p className="text-sm text-gray-600">
                    Estoque atual: {ingredient.stock} {ingredient.unit}
                  </p>
                  <p className="text-sm text-red-600">
                    Mínimo: {ingredient.minStock} {ingredient.unit}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Ingredientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ingredients.map((ingredient) => {
          const isLowStock = ingredient.stock <= ingredient.minStock
          const currentStock = updatingStock[ingredient.id] ?? ingredient.stock

          return (
            <Card key={ingredient.id} className={isLowStock ? "border-red-200" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                  {isLowStock && <Badge variant="destructive">Baixo</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Estoque Atual</p>
                    <p className="font-semibold">
                      {ingredient.stock} {ingredient.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Estoque Mínimo</p>
                    <p className="font-semibold">
                      {ingredient.minStock} {ingredient.unit}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Atualizar Estoque</p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStockChange(ingredient.id, Math.max(0, currentStock - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={currentStock}
                      onChange={(e) => handleStockChange(ingredient.id, Number.parseFloat(e.target.value) || 0)}
                      className="text-center"
                      min="0"
                      step="0.1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStockChange(ingredient.id, currentStock + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {updatingStock[ingredient.id] !== undefined && (
                    <Button size="sm" className="w-full mt-2" onClick={() => saveStockChange(ingredient.id)}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Última atualização: {new Date(ingredient.lastUpdated).toLocaleString("pt-BR")}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
