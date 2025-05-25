import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { cep: string } }) {
  try {
    const cep = params.cep.replace(/\D/g, "")

    if (cep.length !== 8) {
      return NextResponse.json({ error: "CEP deve ter 8 dígitos" }, { status: 400 })
    }

    // Consultar ViaCEP
    const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const viaCepData = await viaCepResponse.json()

    if (viaCepData.erro) {
      return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      cep: viaCepData.cep,
      logradouro: viaCepData.logradouro,
      complemento: viaCepData.complemento,
      bairro: viaCepData.bairro,
      localidade: viaCepData.localidade,
      uf: viaCepData.uf,
      ibge: viaCepData.ibge,
      gia: viaCepData.gia,
      ddd: viaCepData.ddd,
      siafi: viaCepData.siafi,
    })
  } catch (error) {
    console.error("Erro ao buscar CEP:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
