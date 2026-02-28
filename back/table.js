import pool from "./config/db.js"



const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS persons (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE NOT NULL,
        place_of_birth VARCHAR(150) NOT NULL,
        nationality VARCHAR(100) NOT NULL,
        gender VARCHAR(20) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Persons table created successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error creating table:", error);
    process.exit(1);
  }
};

createTable();