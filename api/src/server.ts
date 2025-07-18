import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import generalRoutes from "./routes/general";
import projectRoutes from "./routes/project";
import employeeRoutes from "./routes/employee";
import courseRoutes from "./routes/course";
import plRoutes from "./routes/pl";
import clRoutes from "./routes/cl";
import dlRoutes from "./routes/dl";
import mlUserDataRoutes from "./routesML/mlUserData";
import pathExplorerRoutes from "./routes/pathexplorer";
import fs from "fs";
import cookieParser from "cookie-parser";

dotenv.config();

// Use __dirname directly in CommonJS
// Node.js in CommonJS mode provides __dirname globally
const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 3003;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve certificate PDFs statically
app.use('/uploads/certificates', express.static(path.join(__dirname, '../uploads/certificates')));

app.use(express.static(path.join(__dirname, "public")));

app.use("/general", generalRoutes);
app.use("/project", projectRoutes);
app.use("/employee", employeeRoutes);
app.use("/course", courseRoutes);
app.use("/pl", plRoutes);
app.use("/cl", clRoutes);
app.use("/dl", dlRoutes);
app.use("/ml-user-data", mlUserDataRoutes);
app.use("/path-explorer", pathExplorerRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World! 🌍");
});

app.get("/schema", (req, res) => {
  const schemaPath = path.join(__dirname, "../prisma", "schema.prisma");

  fs.readFile(schemaPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read schema.prisma" });
    }
    res.type("text/plain").send(data);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
