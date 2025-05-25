import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { AdminProvider } from "@/contexts/admin-context"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pizzaria Delícia",
  description: "As melhores pizzas de Brasília",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <AdminProvider>
              <Navbar />
              <main className="min-h-screen bg-gray-50">{children}</main>
              <Toaster />
            </AdminProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
