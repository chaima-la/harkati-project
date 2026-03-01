import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const testDBConnection = async() => {
    try {
        const res = await pool.query("SELECT current_database()");
        console.log("✅ CONNECTED TO DB:", res.rows[0]);

        const dbs = await pool.query("SELECT datname FROM pg_database ORDER BY datname;");
        console.log("📌 DATABASES:", dbs.rows.map(r => r.datname));
    } catch (err) {
        console.error("❌ FULL ERROR:");
        console.error(err);
        process.exit(1);
    }
};
