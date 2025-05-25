import fs from "fs"
import path from "path"

const dataDir = path.join(process.cwd(), "data")

// Garantir que o diretório data existe
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

export async function readJsonFile<T>(filename: string): Promise<T[]> {
  try {
    ensureDataDir()
    const filePath = path.join(dataDir, filename)

    // Se o arquivo não existir, criar com array vazio
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2))
      return []
    }

    const fileContent = fs.readFileSync(filePath, "utf8")
    const data = JSON.parse(fileContent)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
    return []
  }
}

export async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  try {
    ensureDataDir()
    const filePath = path.join(dataDir, filename)

    // Fazer backup do arquivo atual antes de escrever
    if (fs.existsSync(filePath)) {
      const backupPath = filePath + ".backup"
      fs.copyFileSync(filePath, backupPath)
    }

    // Escrever os dados
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8")

    // Verificar se foi escrito corretamente
    const verification = fs.readFileSync(filePath, "utf8")
    const parsedData = JSON.parse(verification)

    if (!Array.isArray(parsedData) || parsedData.length !== data.length) {
      throw new Error("Data verification failed after write")
    }

    console.log(`Successfully wrote ${data.length} records to ${filename}`)
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)

    // Tentar restaurar backup se existir
    const filePath = path.join(dataDir, filename)
    const backupPath = filePath + ".backup"
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath)
      console.log(`Restored backup for ${filename}`)
    }

    throw error
  }
}

// Função para inicializar arquivos padrão se não existirem
export async function initializeDataFiles(): Promise<void> {
  ensureDataDir()

  const defaultFiles = {
    "users.json": [
      {
        id: "1",
        email: "admin@pizzaria.com",
        password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
        name: "Administrador",
        role: "admin",
        phone: "(61) 99999-9999",
        address: {
          street: "Rua Principal, 123",
          region: "asa-norte",
          city: "Brasília",
          zipCode: "70000-000",
        },
      },
    ],
    "orders.json": [],
    "pizzas.json": [
      {
        id: "1",
        name: "Margherita",
        description: "Molho de tomate, mussarela, manjericão fresco",
        category: "tradicional",
        ingredients: ["molho-tomate", "mussarela", "manjericao"],
        prices: {
          pequena: 25.9,
          media: 35.9,
          grande: 45.9,
        },
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop",
        available: true,
      },
      {
        id: "2",
        name: "Pepperoni",
        description: "Molho de tomate, mussarela, pepperoni",
        category: "tradicional",
        ingredients: ["molho-tomate", "mussarela", "pepperoni"],
        prices: {
          pequena: 29.9,
          media: 39.9,
          grande: 49.9,
        },
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop",
        available: true,
      },
      {
        id: "3",
        name: "Quatro Queijos",
        description: "Molho branco, mussarela, gorgonzola, parmesão, provolone",
        category: "especial",
        ingredients: ["molho-branco", "mussarela", "gorgonzola", "parmesao", "provolone"],
        prices: {
          pequena: 32.9,
          media: 42.9,
          grande: 52.9,
        },
        image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop",
        available: true,
      },
    ],
    "complements.json": [
      {
        id: "1",
        name: "Coca-Cola 350ml",
        category: "bebida",
        price: 5.5,
        image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=150&h=150&fit=crop",
        available: true,
      },
      {
        id: "2",
        name: "Guaraná Antarctica 350ml",
        category: "bebida",
        price: 5.5,
        image: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=150&h=150&fit=crop",
        available: true,
      },
      {
        id: "3",
        name: "Pudim de Leite",
        category: "sobremesa",
        price: 8.9,
        image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=150&h=150&fit=crop",
        available: true,
      },
    ],
    "shipping.json": [
      {
        region: "asa-sul",
        name: "Asa Sul",
        price: 12.0,
        cepRanges: ["70100-000", "70199-999"],
      },
      {
        region: "asa-norte",
        name: "Asa Norte",
        price: 15.0,
        cepRanges: ["70000-000", "70099-999"],
      },
    ],
    "ingredients.json": [
      {
        id: "molho-tomate",
        name: "Molho de Tomate",
        stock: 50,
        unit: "kg",
        minStock: 10,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "mussarela",
        name: "Mussarela",
        stock: 30,
        unit: "kg",
        minStock: 5,
        lastUpdated: new Date().toISOString(),
      },
    ],
    "machines.json": [
      {
        id: "1",
        name: "Forno Principal",
        type: "forno",
        installDate: "2023-01-15",
        lastMaintenance: "2024-01-01",
        nextMaintenance: "2024-04-01",
        status: "operational",
        hoursUsed: 2400,
        maxHours: 8760,
        notes: "Funcionando perfeitamente",
      },
    ],
  }

  for (const [filename, defaultData] of Object.entries(defaultFiles)) {
    const filePath = path.join(dataDir, filename)
    if (!fs.existsSync(filePath)) {
      await writeJsonFile(filename, defaultData)
    }
  }
}
