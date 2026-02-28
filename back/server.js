import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();


import staffRoutes from "./routes/staff.js";
import { testDBConnection } from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/staff", staffRoutes);
app.get("/ping", (req, res) => {
    res.send("pong");
});

const PORT = process.env.PORT || 5000;

const startServer = async() => {
    await testDBConnection();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();
