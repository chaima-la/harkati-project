import pkg from "pg"
import dotenv from "dotenv"

dotenv.config()

const { Pool } = pkg

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
})

export const testDBConnection = async () => {
  try {
    const res = await pool.query("SELECT NOW()")
    console.log("✅ PostgreSQL Connected")
    console.log("🕒 DB Time:", res.rows[0].now)
  } catch (err) {
    console.error("❌ DB Connection Failed")
    console.error(err.message)
    process.exit(1) // stop server if DB fails
  }
}

export default pool