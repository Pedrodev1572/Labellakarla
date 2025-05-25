"use client"

import Image from "next/image"
import { Users, Award, Heart, Clock, Star, MapPin, Calendar } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">Nossa História</h1>
          <p className="text-xl lg:text-2xl max-w-3xl mx-auto">
            Mais de 10 anos levando sabor, tradição e qualidade para toda Brasília
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* História Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <div className="inline-flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold mb-6">
              <Calendar className="h-5 w-5 mr-2" />
              Desde 2014
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">La Bella Karla</h2>
            <div className="text-lg text-gray-600 mb-6 leading-relaxed space-y-4">
              <p>
                Seja bem-vindo à <strong>Pizzaria La Bella Karla</strong>, onde os algoritmos são de sabor e as exceções
                só acontecem quando a borda é recheada demais.
              </p>
              <p>
                Fundada pela lendária professora de Engenharia de Software, <strong>Karla</strong> — que, além de saber
                mais de código que o GitHub, também entende de fermentação como ninguém — nossa pizzaria nasceu da
                mistura perfeita entre lógica, queijo e paixão.
              </p>
              <p>
                Aqui, cada pizza é cuidadosamente <em>compilada</em> com os melhores ingredientes, seguindo boas
                práticas de sabor e zero bugs na receita (ok, às vezes um tomate fora do lugar, mas nada que um CTRL+Z
                não resolva).
              </p>
              <p>
                Nossos sabores são desenvolvidos com métodos ágeis (a gente decide o recheio na hora) e testes unitários
                são feitos por clientes famintos, que garantem que cada fatia está 100% aprovada em produção.
              </p>
              <p>
                Se você acha que engenharia de software não combina com molho de tomate… claramente nunca comeu aqui.
                🍅💻
              </p>
              <p className="font-semibold text-red-600">
                Então venha nos visitar, experimentar a <strong>Pizza Orientada a Queijo</strong> e descobrir por que a
                única coisa que travamos por aqui é a dieta!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-8 w-8 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">10k+</div>
                <div className="text-sm text-gray-600">Clientes Satisfeitos</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">10+</div>
                <div className="text-sm text-gray-600">Anos de Experiência</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600">Feito com Amor</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <Image
              src="https://bing.com/th/id/BCO.c27eac49-44bf-4b88-bd8a-2f2b30ab4a43.png"
              alt="Nossa pizzaria"
              width={600}
              height={400}
              className="rounded-lg shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-white fill-current" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">4.9/5</div>
                  <div className="text-sm text-gray-600">Avaliação Média</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nossos Valores */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nossos Valores</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Os princípios que guiam nosso trabalho todos os dias
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl mb-3">Paixão</CardTitle>
              <p className="text-gray-600">
                Fazemos cada pizza com amor e dedicação, como se fosse para nossa própria família.
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl mb-3">Qualidade</CardTitle>
              <p className="text-gray-600">Ingredientes selecionados e processos rigorosos garantem o melhor sabor.</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl mb-3">Agilidade</CardTitle>
              <p className="text-gray-600">Entrega rápida sem comprometer a qualidade, porque seu tempo é valioso.</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl mb-3">Família</CardTitle>
              <p className="text-gray-600">
                Tratamos cada cliente como parte da nossa família, com carinho e respeito.
              </p>
            </Card>
          </div>
        </section>

        {/* Nosso Processo */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Como Fazemos Nossas Pizzas</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Um processo artesanal que garante sabor e qualidade únicos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Massa Artesanal</h3>
              <p className="text-gray-600">
                Preparamos nossa massa diariamente com ingredientes selecionados e fermentação natural.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Ingredientes Frescos</h3>
              <p className="text-gray-600">
                Selecionamos os melhores ingredientes do mercado, sempre frescos e de qualidade.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Forno Especial</h3>
              <p className="text-gray-600">Assamos em forno especial que garante a temperatura e textura perfeitas.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Entrega Rápida</h3>
              <p className="text-gray-600">
                Entregamos quentinha na sua casa em até 30 minutos, mantendo todo o sabor.
              </p>
            </div>
          </div>
        </section>

        {/* Localização */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nossa Localização</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Venha nos visitar ou peça delivery para toda Brasília
            </p>
          </div>

          <Card className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <MapPin className="h-6 w-6 text-red-600 mr-3" />
                  <h3 className="text-2xl font-semibold">Endereço Principal</h3>
                </div>
                <p className="text-lg text-gray-700 mb-2">UDF - Centro Universitário</p>
                <p className="text-lg text-gray-700 mb-6">Asa Sul - Brasília/DF</p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Horário de Funcionamento:</h4>
                    <p className="text-gray-600">Segunda a Quinta: 18:00 - 23:30</p>
                    <p className="text-gray-600">Sexta a Domingo: 18:00 - 00:30</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900">Área de Entrega:</h4>
                    <p className="text-gray-600">Todo o Distrito Federal</p>
                    <Badge className="mt-2">Frete grátis acima de R$ 80,00 no Plano Piloto</Badge>
                  </div>
                </div>
              </div>

              <div className="rounded-md overflow-hidden w-full h-[400px]">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p>Mapa da localização</p>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d122412.60294526327!2d-47.901978!3d-15.8026717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935a3aea806d74eb%3A0x139eddc3c7f58173!2sUDF%20-%20Centro%20Universit%C3%A1rio%20-%20Campus%20Sede!5e0!3m2!1spt-BR!2sbr!4v1716836949683!5m2!1spt-BR!2sbr"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
