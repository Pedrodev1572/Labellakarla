import { NextResponse } from "next/server"
import { readJsonFile } from "@/lib/data"

// Função para verificar se uma pizza pode ser feita baseado no estoque
async function checkPizzaAvailability(pizzaId: string, pizzaName: string) {
  try {
    const ingredients = await readJsonFile("ingredients.json")
    const recipes = await readJsonFile("pizza-recipes.json")

    // Encontrar a receita da pizza
    const recipe = recipes.find(
      (r: any) => r.pizzaId === pizzaId || r.pizzaName.toLowerCase() === pizzaName.toLowerCase(),
    )

    if (!recipe) {
      console.log(`Receita não encontrada para pizza: ${pizzaName}`)
      return true // Se não tem receita, considera disponível
    }

    // Verificar ingredientes base
    for (const baseIngredient of recipe.baseIngredients) {
      const ingredient = ingredients.find((ing: any) => ing.id === baseIngredient.ingredientId)
      if (!ingredient) continue

      // Verificar se tem estoque suficiente para pelo menos 1 pizza pequena
      const requiredQuantity = baseIngredient.quantity * 0.7 // Multiplicador da pizza pequena
      if (ingredient.stock < requiredQuantity) {
        console.log(
          `Pizza ${pizzaName} indisponível: ${ingredient.name} insuficiente (${ingredient.stock} < ${requiredQuantity})`,
        )
        return false
      }
    }

    // Verificar ingredientes específicos
    for (const specificIngredient of recipe.specificIngredients) {
      const ingredient = ingredients.find((ing: any) => ing.id === specificIngredient.ingredientId)
      if (!ingredient) continue

      // Verificar se tem estoque suficiente para pelo menos 1 pizza pequena
      const requiredQuantity = specificIngredient.quantity * 0.7 // Multiplicador da pizza pequena
      if (ingredient.stock < requiredQuantity) {
        console.log(
          `Pizza ${pizzaName} indisponível: ${ingredient.name} insuficiente (${ingredient.stock} < ${requiredQuantity})`,
        )
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Erro ao verificar disponibilidade da pizza:", error)
    return true // Em caso de erro, considera disponível
  }
}

export async function GET() {
  try {
    const pizzas = await readJsonFile("pizzas.json")

    // Verificar disponibilidade de cada pizza baseado no estoque
    const pizzasWithAvailability = await Promise.all(
      pizzas.map(async (pizza: any) => {
        const stockAvailable = await checkPizzaAvailability(pizza.id, pizza.name)
        return {
          ...pizza,
          available: pizza.available && stockAvailable, // Disponível apenas se estiver ativa E tiver estoque
          stockAvailable, // Campo adicional para debug
        }
      }),
    )

    return NextResponse.json(pizzasWithAvailability)
  } catch (error) {
    console.error("Erro ao buscar pizzas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
