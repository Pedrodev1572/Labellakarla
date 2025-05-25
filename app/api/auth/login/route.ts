import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile, initializeDataFiles } from "@/lib/data"
import { verifyPassword, type User } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await initializeDataFiles()
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const users = await readJsonFile<User>("users.json")
    const user = users.find((u) => u.email === email)

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "Login realizado com sucesso",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
