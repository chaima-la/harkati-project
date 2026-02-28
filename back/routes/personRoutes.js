import express from "express";
import { createPerson, getAllPersons } from "../controllers/personController.js";

const router = express.Router();

router.post("/create-person", createPerson);
router.get("/all", getAllPersons);

export default router;