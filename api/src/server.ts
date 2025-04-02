import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import generalRoutes from "./routes/general";
import projectRoutes from "./routes/project";
import employeeRoutes from "./routes/employee";
import courseRoutes from "./routes/course";

dotenv.config();

// Use __dirname directly in CommonJS
// Node.js in CommonJS mode provides __dirname globally
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
