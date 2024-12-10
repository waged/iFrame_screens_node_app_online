import express, { Request, Response, NextFunction } from "express";
import https from "https";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import requestIp from "request-ip";
import bodyParser from "body-parser";
import cors from "cors";
import xss from "xss";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import companyRoutes from "./routes/companyRoutes";
import productRoutes from "./routes/productRoutes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
export const connectDB = async (): Promise<void> => {
  try {
    const MONGO_URI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?${process.env.MONGO_OPTIONS}`;
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB database: Regal");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process if DB connection fails
  }
};

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  keyGenerator: (req: Request) => requestIp.getClientIp(req) || "unknown",
});

// Middleware for XSS sanitization
const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (data: any) => (typeof data === "string" ? xss(data) : data);

  if (req.body) req.body = Object.fromEntries(Object.entries(req.body).map(([key, value]) => [key, sanitize(value)]));
  if (req.query) req.query = Object.fromEntries(Object.entries(req.query).map(([key, value]) => [key, sanitize(value)]));
  if (req.params) req.params = Object.fromEntries(Object.entries(req.params).map(([key, value]) => [key, sanitize(value)]));

  next();
};

// Apply middleware
app.use(express.json());
app.use(bodyParser.json({ limit: "100kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());
app.use(cors());
app.use(requestIp.mw());
app.use(sanitizeMiddleware);
app.use(limiter);
app.use(helmet());

// Security Headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "SAMEORIGIN");
  res.header("X-XSS-Protection", "1; mode=block");
  next();
});

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "trusted-cdn.com"],
    },
  })
);

app.set("trust proxy", "127.0.0.1");

// Connect MongoDB
connectDB();


// Routes
app.use("/regal/api/user", userRoutes);
app.use("/regal/api/company", companyRoutes);
app.use("/regal/api/product", productRoutes);


// Test API Endpoint normally it should be the web-page of the regal.
app.get("/regal/test", (req: Request, res: Response) => {
  console.log("GET /regal/test was hit");
  res.status(200).json({ message: "Hello from my minimal app in TypeScript!" });
});

// HTTPS Server
const server = https.createServer(app);
server.listen(PORT, () => {
  console.log(`Regal Server is running securely at port :${PORT}`);
});
