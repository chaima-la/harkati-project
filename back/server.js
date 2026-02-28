import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { testDBConnection } from "./config/db.js"
import PersonRouter from "./routes/personRoutes.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/person", PersonRouter)
app.get("/test", (req, res) => {
  res.json({
    message: "Server + Routes working ✅",
    time: new Date(),
  });
});
const PORT = process.env.PORT || 5000

// ✅ Test DB first
const startServer = async () => {
  await testDBConnection()

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

startServer()