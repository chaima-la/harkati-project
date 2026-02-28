import pool from "../config/db.js";

export const createPersonDB = async (person) => {
  const query = `
    INSERT INTO persons 
    (first_name, last_name, date_of_birth, place_of_birth, nationality, gender, email, phone)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;

  const values = [
    person.firstName,
    person.lastName,
    person.dateOfBirth,
    person.placeOfBirth,
    person.nationality,
    person.gender,
    person.email,
    person.phone,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const getAllPersonsDB = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM persons ORDER BY id DESC"
  );
  return rows;
};

export const findPersonByEmail = async (email) => {
  const { rows } = await pool.query(
    "SELECT * FROM persons WHERE email = $1",
    [email]
  );
  return rows[0];
};