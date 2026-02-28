import validator from "validator";
import { createPersonDB, findPersonByEmail,getAllPersonsDB } from "../models/personModel.js";

export const createPerson = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      placeOfBirth,
      nationality,
      gender,
      email,
      phone,
    } = req.body;

    // ================= VALIDATIONS =================

    // 1. No empty fields
    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !placeOfBirth ||
      !nationality ||
      !gender ||
      !email ||
      !phone
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Name validation
    if (firstName.length < 2 || lastName.length < 2) {
      return res
        .status(400)
        .json({ message: "First and Last name must be at least 2 characters" });
    }

    // 3. Email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const existing = await findPersonByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 4. Phone validation
    if (!validator.isNumeric(phone)) {
      return res.status(400).json({ message: "Phone must contain only numbers" });
    }

    // 5. Date validation
    const dob = new Date(dateOfBirth);
    const today = new Date();

    if (dob > today) {
      return res.status(400).json({ message: "DOB cannot be in future" });
    }

    // Minimum age 16
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 16) {
      return res.status(400).json({ message: "Minimum age is 16" });
    }

    // ================= CREATE =================

    const person = await createPersonDB({
      firstName,
      lastName,
      dateOfBirth,
      placeOfBirth,
      nationality,
      gender,
      email,
      phone,
    });

    res.status(201).json({
      message: "Person created successfully",
      person,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllPersons = async (req, res) => {
  try {
    console.log("Fetching all persons...")
    const persons = await getAllPersonsDB();
    res.status(200).json(persons);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};