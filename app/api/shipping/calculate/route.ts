import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile } from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const { cep, bairro } = await request.json()

    if (!cep) {
      return NextResponse.json({ error: "CEP é obrigatório" }, { status: 400 })
    }

    // Remove formatação do CEP
    const cleanCep = cep.replace(/\D/g, "")

    if (cleanCep.length !== 8) {
      return NextResponse.json({ error: "CEP deve ter 8 dígitos" }, { status: 400 })
    }

    const shippingRegions = await readJsonFile("shipping.json")

    // Se temos o bairro da API, usar para busca mais precisa
    let foundRegion = null

    if (bairro) {
      // Buscar por nome do bairro primeiro
      foundRegion = shippingRegions.find(
        (region: any) =>
          region.neighborhoods &&
          region.neighborhoods.some((neighborhood: string) =>
            neighborhood.toLowerCase().includes(bairro.toLowerCase()),
          ),
      )
    }

    // Se não encontrou por bairro, buscar por faixa de CEP
    if (!foundRegion) {
      const cepNum = Number.parseInt(cleanCep)
      const isDF = cepNum >= 70000000 && cepNum <= 72999999

      if (!isDF) {
        return NextResponse.json(
          {
            error: "Região não atendida",
            message: "Infelizmente, não entregamos nesse local.",
          },
          { status: 404 },
        )
      }

      for (const region of shippingRegions) {
        if (region.region === "outras-df") continue

        const isInRange = region.cepRanges.some((range: string) => {
          const [start, end] = range.split("-").map((r: string) => r.replace(/\D/g, ""))
          const startNum = Number.parseInt(start)
          const endNum = Number.parseInt(end)
          return cepNum >= startNum && cepNum <= endNum
        })

        if (isInRange) {
          foundRegion = region
          break
        }
      }
    }

    // Se não encontrou uma região específica, usar "outras regiões do DF"
    if (!foundRegion) {
      foundRegion = shippingRegions.find((region: any) => region.region === "outras-df")
    }

    if (!foundRegion) {
      return NextResponse.json(
        {
          error: "Região não atendida",
          message: "Infelizmente, não entregamos nesse local.",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      region: foundRegion.region,
      name: foundRegion.name,
      price: foundRegion.price,
      cep: cleanCep,
    })
  } catch (error) {
    console.error("Erro ao calcular frete:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
