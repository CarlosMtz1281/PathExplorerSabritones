import express from "express";
import cors from "cors";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import generalRoutes from "./routes/general.js";
import projectRoutes from "./routes/project.js";
import employeeRoutes from "./routes/employee.js";
import courseRoutes from "./routes/course.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/general", generalRoutes);
app.use("/project", projectRoutes);
app.use("/employee", employeeRoutes);
app.use("/course", courseRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World! 🌍");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
