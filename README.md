# 🍕 La Bella Karla - Sistema de Pizzaria

> Onde os algoritmos são de sabor e as exceções só acontecem quando a borda é recheada demais! 💻🍕


### ✨ Características Principais

- 🍕 **Cardápio Digital** com pizzas temáticas de programação
- 🛒 **Sistema de Carrinho** com bordas recheadas personalizáveis
- 👨‍💼 **Painel Administrativo** completo
- 📦 **Gestão de Estoque** com controle automático de ingredientes
- 🏭 **Controle de Máquinas** industriais com manutenção programada
- 🚚 **Sistema de Entrega** com cálculo automático de frete
- 👤 **Autenticação** de usuários e administradores
- 📱 **Design Responsivo** para todos os dispositivos

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Shadcn/ui** - Componentes de interface
- **Lucide React** - Ícones modernos

### Backend
- **Next.js API Routes** - Endpoints RESTful
- **Node.js** - Runtime JavaScript
- **bcryptjs** - Criptografia de senhas
- **jsonwebtoken** - Autenticação JWT

### Armazenamento
- **JSON Files** - Banco de dados em arquivos
- **File System** - Gerenciamento de dados local



## 🏗️ Arquitetura do Sistema

```
📁 la-bella-karla/
├── 📁 app/                    # App Router (Next.js 15)
│   ├── 📁 api/               # Endpoints da API
│   │   ├── 📁 auth/          # Autenticação
│   │   ├── 📁 orders/        # Gestão de pedidos
│   │   ├── 📁 pizzas/        # Cardápio
│   │   ├── 📁 ingredients/   # Estoque
│   │   └── 📁 machines/      # Equipamentos
│   ├── 📁 admin/             # Painel administrativo
│   ├── 📁 cardapio/          # Cardápio público
│   ├── 📁 cart/              # Carrinho de compras
│   └── 📄 page.tsx           # Página inicial
├── 📁 components/            # Componentes reutilizáveis
├── 📁 contexts/              # Context API (Estado global)
├── 📁 data/                  # Banco de dados JSON
├── 📁 lib/                   # Utilitários e helpers
└── 📄 README.md              # Este arquivo
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos para instalação

1. **Clone o repositório**
```bash
git clone https://github.com/Joaovictorsmeira/la-bella-karla.git
cd la-bella-karla
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Execute o projeto**
```bash
npm run dev
# ou
yarn dev
```

4. **Acesse o sistema**
- Frontend: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

### Credenciais padrão
- **Email:** admin@pizzaria.com
- **Senha:** password

## 📱 Funcionalidades

### 🍕 Para Clientes
- [x] Navegação no cardápio com filtros
- [x] Personalização de pizzas (tamanho e borda)
- [x] Carrinho de compras inteligente
- [x] Cálculo automático de frete
- [x] Acompanhamento de pedidos
- [x] Histórico de compras
- [x] Perfil de usuário

### 👨‍💼 Para Administradores
- [x] Dashboard com métricas em tempo real
- [x] Gestão completa do cardápio
- [x] Controle de estoque automático
- [x] Monitoramento de máquinas
- [x] Gestão de pedidos
- [x] Relatórios de vendas
- [x] Gestão de complementos

### 🏭 Sistema Industrial
- [x] Controle de máquinas (fornos, geladeiras, masseiras)
- [x] Agendamento de manutenções
- [x] Monitoramento de horas de uso
- [x] Alertas automáticos
- [x] Histórico de manutenções


## 👩‍💻 Autores

**João Victor Silva Meira, Pedro Carvalho, Pedro Souza, Bruno Henrique, Marcos Paulo, Miguel Fagundes** 