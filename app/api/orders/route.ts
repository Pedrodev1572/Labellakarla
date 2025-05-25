import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile, writeJsonFile, initializeDataFiles } from "@/lib/data"
import { generateId } from "@/lib/auth"

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

// Função para encontrar receita por nome da pizza
function findRecipeByName(recipes: any[], pizzaName: string) {
  return recipes.find(
    (recipe: any) =>
      recipe.pizzaName.toLowerCase() === pizzaName.toLowerCase() ||
      pizzaName.toLowerCase().includes(recipe.pizzaName.toLowerCase()),
  )
}

// Função para atualizar estoque baseado no pedido
async function updateStockForOrder(orderItems: any[]) {
  try {
    const ingredients = await readJsonFile("ingredients.json")
    const recipes = await readJsonFile("pizza-recipes.json")
    const machines = await readJsonFile("machines.json")

    let totalCookingTime = 0
    let pizzasProduced = 0

    console.log("=== INICIANDO ATUALIZAÇÃO DE ESTOQUE ===")
    console.log("Itens do pedido:", orderItems)

    for (const item of orderItems) {
      if (item.type === "pizza") {
        console.log(`\n--- Processando pizza: ${item.name} ---`)

        // Multiplicador baseado no tamanho
        const sizeMultiplier = item.size === "pequena" ? 0.7 : item.size === "grande" ? 1.3 : 1.0
        console.log(`Tamanho: ${item.size}, Multiplicador: ${sizeMultiplier}, Quantidade: ${item.quantity}`)

        // Se a pizza tem múltiplos sabores, processar cada um
        if (item.flavors && item.flavors.length > 0) {
          for (const flavor of item.flavors) {
            const recipe = findRecipeByName(recipes, flavor)
            if (recipe) {
              console.log(`Encontrada receita para: ${flavor}`)

              // Processar ingredientes base (dividido pelo número de sabores)
              const flavorDivider = item.flavors.length
              for (const baseIngredient of recipe.baseIngredients) {
                const ingredientIndex = ingredients.findIndex((ing: any) => ing.id === baseIngredient.ingredientId)
                if (ingredientIndex !== -1) {
                  const consumedQuantity = (baseIngredient.quantity * sizeMultiplier * item.quantity) / flavorDivider
                  const oldStock = ingredients[ingredientIndex].stock
                  ingredients[ingredientIndex].stock = Math.max(
                    0,
                    ingredients[ingredientIndex].stock - consumedQuantity,
                  )
                  ingredients[ingredientIndex].lastUpdated = new Date().toISOString()

                  console.log(
                    `${ingredients[ingredientIndex].name}: ${oldStock} -> ${ingredients[ingredientIndex].stock} (consumido: ${consumedQuantity.toFixed(3)})`,
                  )
                }
              }

              // Processar ingredientes específicos (dividido pelo número de sabores)
              for (const specificIngredient of recipe.specificIngredients) {
                const ingredientIndex = ingredients.findIndex((ing: any) => ing.id === specificIngredient.ingredientId)
                if (ingredientIndex !== -1) {
                  const consumedQuantity =
                    (specificIngredient.quantity * sizeMultiplier * item.quantity) / flavorDivider
                  const oldStock = ingredients[ingredientIndex].stock
                  ingredients[ingredientIndex].stock = Math.max(
                    0,
                    ingredients[ingredientIndex].stock - consumedQuantity,
                  )
                  ingredients[ingredientIndex].lastUpdated = new Date().toISOString()

                  console.log(
                    `${ingredients[ingredientIndex].name}: ${oldStock} -> ${ingredients[ingredientIndex].stock} (consumido: ${consumedQuantity.toFixed(3)})`,
                  )
                }
              }
            } else {
              console.log(`Receita não encontrada para: ${flavor}`)
            }
          }
        } else {
          // Pizza de sabor único
          const recipe = findRecipeByName(recipes, item.name)
          if (recipe) {
            console.log(`Encontrada receita para: ${item.name}`)

            // Processar ingredientes base
            for (const baseIngredient of recipe.baseIngredients) {
              const ingredientIndex = ingredients.findIndex((ing: any) => ing.id === baseIngredient.ingredientId)
              if (ingredientIndex !== -1) {
                const consumedQuantity = baseIngredient.quantity * sizeMultiplier * item.quantity
                const oldStock = ingredients[ingredientIndex].stock
                ingredients[ingredientIndex].stock = Math.max(0, ingredients[ingredientIndex].stock - consumedQuantity)
                ingredients[ingredientIndex].lastUpdated = new Date().toISOString()

                console.log(
                  `${ingredients[ingredientIndex].name}: ${oldStock} -> ${ingredients[ingredientIndex].stock} (consumido: ${consumedQuantity.toFixed(3)})`,
                )
              }
            }

            // Processar ingredientes específicos
            for (const specificIngredient of recipe.specificIngredients) {
              const ingredientIndex = ingredients.findIndex((ing: any) => ing.id === specificIngredient.ingredientId)
              if (ingredientIndex !== -1) {
                const consumedQuantity = specificIngredient.quantity * sizeMultiplier * item.quantity
                const oldStock = ingredients[ingredientIndex].stock
                ingredients[ingredientIndex].stock = Math.max(0, ingredients[ingredientIndex].stock - consumedQuantity)
                ingredients[ingredientIndex].lastUpdated = new Date().toISOString()

                console.log(
                  `${ingredients[ingredientIndex].name}: ${oldStock} -> ${ingredients[ingredientIndex].stock} (consumido: ${consumedQuantity.toFixed(3)})`,
                )
              }
            }
          } else {
            console.log(`Receita não encontrada para: ${item.name}`)
          }
        }

        // Calcular tempo de cozimento (15 min por pizza)
        totalCookingTime += 15 * item.quantity
        pizzasProduced += item.quantity
      }
    }

    // Atualizar horas de uso da masseira industrial (5 min por pizza)
    const masseirIndex = machines.findIndex((m: any) => m.type === "masseira")
    if (masseirIndex !== -1 && pizzasProduced > 0) {
      const massaTime = (pizzasProduced * 5) / 60 // 5 minutos por pizza convertido para horas
      const oldMasseirHours = machines[masseirIndex].hoursUsed
      machines[masseirIndex].hoursUsed += massaTime

      console.log(`\n--- ATUALIZAÇÃO DA MASSEIRA ---`)
      console.log(`Horas anteriores: ${oldMasseirHours}`)
      console.log(`Horas adicionadas: ${massaTime.toFixed(2)}`)
      console.log(`Total de horas: ${machines[masseirIndex].hoursUsed.toFixed(2)}`)

      // Verificar se precisa de manutenção
      const masseirUsagePercentage = (machines[masseirIndex].hoursUsed / machines[masseirIndex].maxHours) * 100
      if (masseirUsagePercentage >= 90 && machines[masseirIndex].status === "operational") {
        machines[masseirIndex].status = "maintenance_needed"
        machines[masseirIndex].notes =
          `Manutenção necessária - ${masseirUsagePercentage.toFixed(1)}% das horas de uso atingidas`
        console.log(`Status da masseira alterado para manutenção necessária (${masseirUsagePercentage.toFixed(1)}%)`)
      }
    }

    // Atualizar horas de uso do forno
    const ovenIndex = machines.findIndex((m: any) => m.type === "forno")
    if (ovenIndex !== -1) {
      const cookingHours = totalCookingTime / 60
      const oldHours = machines[ovenIndex].hoursUsed
      machines[ovenIndex].hoursUsed += cookingHours

      console.log(`\n--- ATUALIZAÇÃO DO FORNO ---`)
      console.log(`Horas anteriores: ${oldHours}`)
      console.log(`Horas adicionadas: ${cookingHours.toFixed(2)}`)
      console.log(`Total de horas: ${machines[ovenIndex].hoursUsed.toFixed(2)}`)

      // Verificar se precisa de manutenção
      const usagePercentage = (machines[ovenIndex].hoursUsed / machines[ovenIndex].maxHours) * 100
      if (usagePercentage >= 90 && machines[ovenIndex].status === "operational") {
        machines[ovenIndex].status = "maintenance_needed"
        machines[ovenIndex].notes = `Manutenção necessária - ${usagePercentage.toFixed(1)}% das horas de uso atingidas`
        console.log(`Status alterado para manutenção necessária (${usagePercentage.toFixed(1)}%)`)
      }
    }

    // Salvar atualizações
    await writeJsonFile("ingredients.json", ingredients)
    await writeJsonFile("machines.json", machines)

    console.log(`\n=== RESUMO ===`)
    console.log(`Pizzas produzidas: ${pizzasProduced}`)
    console.log(`Tempo total de cozimento: ${totalCookingTime} minutos`)
    console.log(`Estoque e máquinas atualizados com sucesso!`)
    console.log("=== FIM DA ATUALIZAÇÃO ===\n")
  } catch (error) {
    console.error("Erro ao atualizar estoque:", error)
  }
}

export async function GET() {
  try {
    await initializeDataFiles()
    const orders = await readJsonFile<Order>("orders.json")
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDataFiles()
    const orderData = await request.json()

    const orders = await readJsonFile<Order>("orders.json")

    const newOrder: Order = {
      id: generateId(),
      ...orderData,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    orders.push(newOrder)
    await writeJsonFile("orders.json", orders)

    // Atualizar estoque e máquinas
    await updateStockForOrder(newOrder.items)

    return NextResponse.json(
      {
        message: "Pedido criado com sucesso",
        order: newOrder,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro ao criar pedido:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
