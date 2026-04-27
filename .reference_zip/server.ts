import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // MongoDB Connection 
  const MONGODB_URI = process.env.MONGODB_URI;
  let isDbConnected = false;

  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to Cloud MongoDB");
      isDbConnected = true;
    } catch (err) {
      console.error("MongoDB connection error:", err);
    }
  } else {
    console.log("MONGODB_URI not found in environment. Using locally served products only.");
  }

  // Product Schema
  const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    category: String,
    imageUrl: String,
    price: String,
  }, { timestamps: true });

  const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

  // Function to get fallback products from local JSON
  const getLocalProducts = async () => {
    try {
      const dataPath = path.join(__dirname, "data", "products.json");
      const fileContent = await fs.readFile(dataPath, "utf-8");
      return JSON.parse(fileContent);
    } catch (e) {
      return [];
    }
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      database: isDbConnected ? "Connected (Cloud)" : "Connected (Local File Fallback)"
    });
  });

  // Seed Route: Push local JSON data to Cloud DB
  app.post("/api/seed", async (req, res) => {
    if (!isDbConnected) return res.status(400).json({ error: "DB not connected. Set MONGODB_URI first." });
    
    try {
      const localProducts = await getLocalProducts();
      // Clear existing and insert
      await Product.deleteMany({});
      const result = await Product.insertMany(localProducts.map(({ id, ...rest }) => rest));
      res.json({ message: "Database seeded successfully", count: result.length });
    } catch (err) {
      res.status(500).json({ error: "Seeding failed", detail: err });
    }
  });

  // Main Products Route (Hybrid: Cloud first, then local)
  app.get("/api/products", async (req, res) => {
    try {
      if (isDbConnected) {
        const products = await Product.find().sort({ createdAt: -1 });
        if (products.length > 0) return res.json(products);
      }
      
      // Fallback or missing cloud data
      const localProducts = await getLocalProducts();
      res.json(localProducts);
    } catch (err) {
      console.error("Fetch error:", err);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
