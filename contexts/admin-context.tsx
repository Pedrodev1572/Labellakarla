"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface AdminContextType {
  lastUpdate: number
  triggerUpdate: () => void
  pendingOrders: number
  setPendingOrders: (count: number) => void
}

const AdminContext = createContext<AdminContextType | null>(null)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [pendingOrders, setPendingOrders] = useState(0)

  const triggerUpdate = () => {
    const newTimestamp = Date.now()
    setLastUpdate(newTimestamp)
    // Salvar no localStorage para sincronizar entre abas
    localStorage.setItem("admin-last-update", newTimestamp.toString())

    // Disparar evento customizado para notificar outras páginas
    window.dispatchEvent(
      new CustomEvent("admin-data-updated", {
        detail: { timestamp: newTimestamp },
      }),
    )

    console.log("Admin data update triggered:", new Date(newTimestamp).toLocaleTimeString())
  }

  useEffect(() => {
    // Escutar mudanças no localStorage para sincronizar entre abas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "admin-last-update" && e.newValue) {
        setLastUpdate(Number.parseInt(e.newValue))
      }
    }

    // Escutar evento customizado para atualizações na mesma aba
    const handleCustomUpdate = (e: CustomEvent) => {
      setLastUpdate(e.detail.timestamp)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("admin-data-updated", handleCustomUpdate as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("admin-data-updated", handleCustomUpdate as EventListener)
    }
  }, [])

  return (
    <AdminContext.Provider value={{ lastUpdate, triggerUpdate, pendingOrders, setPendingOrders }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
