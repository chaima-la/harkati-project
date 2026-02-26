import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import personRoutes from "./routes/person.js"
import { testDBConnection } from "./config/db.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/test", personRoutes)

const PORT = process.env.PORT || 5000

// ✅ Test DB first
const startServer = async () => {
  await testDBConnection()

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

startServer()