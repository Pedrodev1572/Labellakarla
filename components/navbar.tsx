"use client"

import Link from "next/link"
import { ShoppingCart, User, Pizza, LogOut, Menu, X, Package } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"

export function Navbar() {
  const { user, logout } = useAuth()
  const { state } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [pendingOrders, setPendingOrders] = useState(0)

  // Verificar pedidos pendentes do usuário
  useEffect(() => {
    if (user && user.role === "customer") {
      fetchUserPendingOrders()

      // Atualizar a cada 30 segundos
      const interval = setInterval(fetchUserPendingOrders, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchUserPendingOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      const orders = await response.json()
      const userOrders = orders.filter(
        (order: any) => order.userId === user?.id && !["delivered", "cancelled"].includes(order.status),
      )
      setPendingOrders(userOrders.length)
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error)
    }
  }

  return (
    <nav className="bg-red-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo e Menu Principal */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 hover:scale-105 transition-transform">
            <img 
              src="https://bing.com/th/id/BCO.91457e1a-35d5-4919-b7b7-4b37864eb2b6.png" 
              alt="Ícone La Bella Karla" 
              className="h-20 w-20 object-contain" // h-9 w-9 = 36x36 pixels (mesmo tamanho do ícone anterior)
            />
            <span className="font-bold text-xl lg:text-2xl">La Bella Karla</span>
          </Link>

            {/* Menu Desktop */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                href="/"
                className="text-white hover:text-yellow-300 transition-colors font-medium px-3 py-2 rounded-md hover:bg-red-700"
              >
                Início
              </Link>
              <Link
                href="/cardapio"
                className="text-white hover:text-yellow-300 transition-colors font-medium px-3 py-2 rounded-md hover:bg-red-700"
              >
                Cardápio
              </Link>
              <Link
                href="/sobre"
                className="text-white hover:text-yellow-300 transition-colors font-medium px-3 py-2 rounded-md hover:bg-red-700"
              >
                Sobre Nós
              </Link>
              <Link
                href="/contato"
                className="text-white hover:text-yellow-300 transition-colors font-medium px-3 py-2 rounded-md hover:bg-red-700"
              >
                Contato
              </Link>
            </div>
          </div>

          {/* Ações do Usuário */}
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                {/* Meus Pedidos - Destaque para clientes */}
                {user.role === "customer" && (
                  <Link href="/my-orders" className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-red-700 font-medium px-4 py-2 h-10"
                    >
                      <Package className="h-5 w-5 mr-2" />
                      <span className="hidden sm:inline">Meus Pedidos</span>
                      {pendingOrders > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black min-w-[20px] h-5 flex items-center justify-center text-xs font-bold">
                          {pendingOrders}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )}

                {/* Carrinho */}
                <Link href="/cart" className="relative">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-red-700 px-4 py-2 h-10">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="hidden md:inline ml-2">Carrinho</span>
                    {state.items.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black min-w-[20px] h-5 flex items-center justify-center text-xs font-bold">
                        {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Menu do Usuário */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-red-700 px-4 py-2 h-10">
                      <User className="h-5 w-5 mr-2" />
                      <span className="hidden sm:inline max-w-24 truncate">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Meu Perfil
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "customer" && (
                      <DropdownMenuItem asChild>
                        <Link href="/my-orders" className="flex items-center">
                          <Package className="h-4 w-4 mr-2" />
                          Meus Pedidos
                          {pendingOrders > 0 && (
                            <Badge className="ml-auto bg-red-600 text-white text-xs">{pendingOrders}</Badge>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center">
                          <Pizza className="h-4 w-4 mr-2" />
                          Painel Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white hover:bg-red-700 px-6 py-2 h-10 font-medium">
                  <User className="h-5 w-5 mr-2" />
                  Entrar
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-red-700 px-3 py-2 h-10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-red-500 bg-red-700">
            <div className="px-4 pt-4 pb-6 space-y-3">
              <Link
                href="/"
                className="block px-4 py-3 text-white hover:bg-red-600 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                🏠 Início
              </Link>
              <Link
                href="/cardapio"
                className="block px-4 py-3 text-white hover:bg-red-600 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                🍕 Cardápio
              </Link>
              {user && user.role === "customer" && (
                <Link
                  href="/my-orders"
                  className="block px-4 py-3 text-white hover:bg-red-600 rounded-lg font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center justify-between">
                    <span>📦 Meus Pedidos</span>
                    {pendingOrders > 0 && (
                      <Badge className="bg-yellow-500 text-black text-xs font-bold">{pendingOrders}</Badge>
                    )}
                  </div>
                </Link>
              )}
              <Link
                href="/sobre"
                className="block px-4 py-3 text-white hover:bg-red-600 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                👩‍💻 Sobre Nós
              </Link>
              <Link
                href="/contato"
                className="block px-4 py-3 text-white hover:bg-red-600 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                📞 Contato
              </Link>

              {/* Separador */}
              <div className="border-t border-red-500 my-4"></div>

              {/* Carrinho no mobile */}
              <Link
                href="/cart"
                className="block px-4 py-3 text-white hover:bg-red-600 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center justify-between">
                  <span>🛒 Carrinho</span>
                  {state.items.length > 0 && (
                    <Badge className="bg-yellow-500 text-black text-xs font-bold">
                      {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  )}
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
