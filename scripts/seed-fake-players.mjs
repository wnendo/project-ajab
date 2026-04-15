import { initializeApp } from "firebase/app"
import { doc, serverTimestamp, setDoc, writeBatch, getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDnjZcbhtm03HNLQHSr6Wlz6TqOfB-KU9E",
  authDomain: "ranking-ajab.firebaseapp.com",
  projectId: "ranking-ajab"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const CATEGORY_DEFINITIONS = [
  {
    category: "A",
    club: "AJAB Elite",
    names: [
      "Arthur Almeida",
      "Bruno Azevedo",
      "Caio Barros",
      "Diego Campos",
      "Enzo Duarte",
      "Felipe Esteves",
      "Gustavo Faria"
    ]
  },
  {
    category: "B",
    club: "AJAB Performance",
    names: [
      "Heitor Gomes",
      "Igor Henrique",
      "Joao Pedro",
      "Kaique Lima",
      "Lucas Martins",
      "Mateus Nogueira",
      "Nathan Oliveira"
    ]
  },
  {
    category: "C",
    club: "AJAB Evolution",
    names: [
      "Otavio Pereira",
      "Paulo Ricardo",
      "Rafael Ribeiro",
      "Samuel Rocha",
      "Thiago Soares",
      "Victor Teixeira",
      "William Vieira"
    ]
  },
  {
    category: "D",
    club: "AJAB Base",
    names: [
      "Yuri Abreu",
      "Alan Batista",
      "Cesar Costa",
      "Danilo Freitas",
      "Eduardo Galvao",
      "Fabricio Moura",
      "Gabriel Neves"
    ]
  },
  {
    category: "Iniciante",
    club: "AJAB Novatos",
    names: [
      "Helena Alves",
      "Isabela Cunha",
      "Julia Dias",
      "Larissa Fernandes",
      "Marina Lopes",
      "Natalia Moreira",
      "Patricia Silva"
    ]
  }
]

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function buildFakePlayer(categoryDefinition, index) {
  const name = categoryDefinition.names[index]
  const categorySlug = slugify(categoryDefinition.category)
  const playerNumber = String(index + 1).padStart(2, "0")
  const id = `fake-${categorySlug}-${playerNumber}`
  const email = `${id}@ajab-teste.local`

  return {
    id,
    data: {
      name,
      email,
      phone: `(11) 90000-${String(1000 + index).padStart(4, "0")}`,
      club: categoryDefinition.club,
      photoURL: "",
      category: categoryDefinition.category,
      role: "user",
      profileComplete: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      seededAt: serverTimestamp(),
      isFakeSeed: true,
      playerProfile: {
        wins: 0,
        losses: 0,
        games: 0,
        active: false,
        createdAt: Date.now(),
        lastPlayed: null
      }
    }
  }
}

async function seedFakePlayers() {
  const batch = writeBatch(db)
  const fakePlayers = CATEGORY_DEFINITIONS.flatMap((categoryDefinition) =>
    categoryDefinition.names.map((_, index) => buildFakePlayer(categoryDefinition, index))
  )

  fakePlayers.forEach((player) => {
    batch.set(doc(db, "users", player.id), player.data, { merge: true })
  })

  await batch.commit()

  console.log(`Seed concluido com ${fakePlayers.length} atletas ficticios.`)
  console.log("Categorias:", CATEGORY_DEFINITIONS.map((entry) => `${entry.category}: ${entry.names.length}`).join(" | "))
}

seedFakePlayers().catch((error) => {
  console.error("Falha ao criar atletas ficticios:", error)
  process.exitCode = 1
})
