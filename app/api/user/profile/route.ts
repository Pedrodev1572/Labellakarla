import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile, writeJsonFile } from "@/lib/data"
import type { User } from "@/lib/auth"

export async function PUT(request: NextRequest) {
  try {
    const { userId, name, email, phone, street, region, city, zipCode } = await request.json()

    if (!userId || !name || !email || !phone) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 })
    }

    const users = await readJsonFile<User>("users.json")
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Check if email is already used by another user
    const existingUser = users.find((u) => u.email === email && u.id !== userId)
    if (existingUser) {
      return NextResponse.json({ error: "Email já está em uso" }, { status: 400 })
    }

    users[userIndex] = {
      ...users[userIndex],
      name,
      email,
      phone,
      address: {
        street: street || "",
        region: region || "",
        city: city || "Brasília",
        zipCode: zipCode || "",
      },
    }

    await writeJsonFile("users.json", users)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = users[userIndex]

    return NextResponse.json({
      message: "Perfil atualizado com sucesso",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
