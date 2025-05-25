"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, MapPin, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { user, login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    region: "",
    city: "Brasília",
    zipCode: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    setProfileData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      street: user.address.street,
      region: user.address.region,
      city: user.address.city,
      zipCode: user.address.zipCode,
    })
  }, [user, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          ...profileData,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        login(data.user)
        toast({
          title: "Perfil atualizado!",
          description: "Suas informações foram atualizadas com sucesso.",
        })
      } else {
        toast({
          title: "Erro ao atualizar perfil",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: "Erro interno do servidor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </div>

      <form onSubmit={handleUpdateProfile}>
        <div className="space-y-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>Atualize seus dados pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="(61) 99999-9999"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Endereço de Entrega
              </CardTitle>
              <CardDescription>Mantenha seu endereço atualizado para entregas mais rápidas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Endereço Completo</Label>
                <Input
                  id="street"
                  value={profileData.street}
                  onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
                  placeholder="Rua, número, complemento"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="region">Região</Label>
                  <Select
                    value={profileData.region}
                    onValueChange={(value) => setProfileData({ ...profileData, region: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua região" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asa-norte">Asa Norte</SelectItem>
                      <SelectItem value="asa-sul">Asa Sul</SelectItem>
                      <SelectItem value="lago-norte">Lago Norte</SelectItem>
                      <SelectItem value="lago-sul">Lago Sul</SelectItem>
                      <SelectItem value="taguatinga">Taguatinga</SelectItem>
                      <SelectItem value="ceilandia">Ceilândia</SelectItem>
                      <SelectItem value="samambaia">Samambaia</SelectItem>
                      <SelectItem value="planaltina">Planaltina</SelectItem>
                      <SelectItem value="brasilia-centro">Brasília Centro</SelectItem>
                      <SelectItem value="sudoeste">Sudoeste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={profileData.zipCode}
                    onChange={(e) => setProfileData({ ...profileData, zipCode: e.target.value })}
                    placeholder="00000-000"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex gap-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
