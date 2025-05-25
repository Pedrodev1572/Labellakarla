import bcrypt from "bcryptjs"

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: "admin" | "customer"
  phone: string
  address: {
    street: string
    region: string
    city: string
    zipCode: string
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}
