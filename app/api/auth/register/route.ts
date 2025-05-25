import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile, writeJsonFile, initializeDataFiles } from "@/lib/data"
import { hashPassword, generateId, type User } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await initializeDataFiles()
    const { name, email, password, phone, street, region, city, zipCode } = await request.json()

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: "Nome, email, senha e telefone são obrigatórios" }, { status: 400 })
    }

    const users = await readJsonFile<User>("users.json")

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const newUser: User = {
      id: generateId(),
      email,
      password: hashedPassword,
      name,
      role: "customer",
      phone,
      address: {
        street: street || "",
        region: region || "",
        city: city || "Brasília",
        zipCode: zipCode || "",
      },
    }

    users.push(newUser)
    await writeJsonFile("users.json", users)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        user: userWithoutPassword,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro no registro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
