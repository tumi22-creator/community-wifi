import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import protectedRoutes from "./routes/protected.routes.js";

import hotspotRoutes from "./routes/hotspots.routes.js";
import voucherRoutes from "./routes/vouchers.routes.js";
import wifiUserRoutes from "./routes/wifi-users.routes.js";
import sessionRoutes from "./routes/sessions.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";


const app = express();

const PORT = process.env.PORT || 5000;

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Community WiFi API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/hotspots", hotspotRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/wifi-users", wifiUserRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/dashboard", dashboardRoutes);


app.listen(PORT, () => {
  console.log(
    `Community WiFi API running on http://localhost:${PORT}`
  );
});
