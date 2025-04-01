const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const generalRoutes = require("./routes/general");
const projectRoutes = require("./routes/project");
const employeeRoutes = require("./routes/employee");
const courseRoutes = require("./routes/course");

dotenv.config();

const prisma = new PrismaClient();
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3003;



app.use("/general", generalRoutes);
app.use("/project", projectRoutes);
app.use("/employee", employeeRoutes);
app.use("/course", courseRoutes);

// Define a simple route
app.get("/", (req, res) => {
    res.send("Hello, World! 🌍");
    console.log(prisma);
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
