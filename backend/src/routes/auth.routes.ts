import { Router, Request } from "express";
import { prisma } from "../utils/prisma.js";
import {
  comparePassword,
  generateToken,
} from "../utils/auth.js";

const router = Router();

function getClientIp(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }

  return req.socket.remoteAddress || null;
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    const ipAddress = getClientIp(req);

    // Don't reveal whether the account exists.
    if (!user) {
      await prisma.loginAudit.create({
        data: {
          email: normalizedEmail,
          ipAddress,
          userAgent: req.headers["user-agent"],
          status: "FAILED",
        },
      });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status !== "ACTIVE") {
      await prisma.loginAudit.create({
        data: {
          userId: user.id,
          email: normalizedEmail,
          ipAddress,
          userAgent: req.headers["user-agent"],
          status: "FAILED",
        },
      });

      return res.status(403).json({
        success: false,
        message: "Account is not active",
      });
    }

    const passwordValid = await comparePassword(
      password,
      user.passwordHash
    );

    if (!passwordValid) {
      await prisma.loginAudit.create({
        data: {
          userId: user.id,
          email: normalizedEmail,
          ipAddress,
          userAgent: req.headers["user-agent"],
          status: "FAILED",
        },
      });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user.id);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLogin: new Date(),
      },
    });

    await prisma.loginAudit.create({
      data: {
        userId: user.id,
        email: normalizedEmail,
        ipAddress,
        userAgent: req.headers["user-agent"],
        status: "SUCCESS",
      },
    });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;

