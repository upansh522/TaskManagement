import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connect from "./src/db/connect.js";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import errorHandler from "./src/helpers/errorhandler.js";

dotenv.config();

const port = process.env.PORT || 8001;

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "User Service",
    port: port,
    timestamp: new Date().toISOString(),
  });
});

const routeFiles = fs.readdirSync("./src/routes");

routeFiles.forEach((file) => {
  import(`./src/routes/${file}`)
    .then((route) => {
      app.use("/", route.default);
    })
    .catch((err) => {
      console.log("Failed to load route file", err);
    });
});

// Error handler should be after routes
app.use(errorHandler);

const server = async () => {
  try {
    await connect();

    app.listen(port, () => {
      console.log(`User service is running on port ${port}`);
    });
  } catch (error) {
    console.log("Failed to start user service.....", error.message);
    process.exit(1);
  }
};

server();
