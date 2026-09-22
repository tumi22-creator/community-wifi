import { Router } from "express";
import { prisma } from "../utils/prisma.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// GET all usage sessions
router.get("/", authenticate, async (_req, res) => {
  try {
    const sessions = await prisma.usageSession.findMany({
      orderBy: {
        startTime: "desc",
      },
      include: {
        wifiUser: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
        hotspot: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("Get sessions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch usage sessions",
    });
  }
});

// GET one session
router.get("/:id", authenticate, async (req, res) => {
  try {
    const session = await prisma.usageSession.findUnique({
      where: {
        id: String(req.params.id),
      },
      include: {
        wifiUser: true,
        hotspot: true,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Usage session not found",
      });
    }

    return res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Get session error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch usage session",
    });
  }
});

// START usage session
router.post("/start", authenticate, async (req, res) => {
  try {
    const {
      wifiUserId,
      hotspotId,
      device,
      ipAddress,
    } = req.body;

    if (!wifiUserId || !hotspotId) {
      return res.status(400).json({
        success: false,
        message: "wifiUserId and hotspotId are required",
      });
    }

    const wifiUser = await prisma.wifiUser.findUnique({
      where: {
        id: wifiUserId,
      },
    });

    if (!wifiUser) {
      return res.status(404).json({
        success: false,
        message: "WiFi user not found",
      });
    }

    if (wifiUser.status === "BLOCKED") {
      return res.status(403).json({
        success: false,
        message: "WiFi user is blocked",
      });
    }

    const hotspot = await prisma.hotspot.findUnique({
      where: {
        id: hotspotId,
      },
    });

    if (!hotspot) {
      return res.status(404).json({
        success: false,
        message: "Hotspot not found",
      });
    }

    const activeSession = await prisma.usageSession.findFirst({
      where: {
        wifiUserId,
        endTime: null,
      },
    });

    if (activeSession) {
      return res.status(409).json({
        success: false,
        message: "WiFi user already has an active session",
        session: activeSession,
      });
    }

    const session = await prisma.usageSession.create({
      data: {
        wifiUserId,
        hotspotId,
        device: device || wifiUser.device || null,
        ipAddress: ipAddress || null,
      },
      include: {
        wifiUser: true,
        hotspot: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Usage session started",
      session,
    });
  } catch (error) {
    console.error("Start session error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start usage session",
    });
  }
});

// UPDATE data usage
router.patch("/:id/usage", authenticate, async (req, res) => {
  try {
    const { dataUsedMb } = req.body;

    if (
      dataUsedMb === undefined ||
      !Number.isFinite(Number(dataUsedMb)) ||
      Number(dataUsedMb) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "dataUsedMb must be a valid non-negative number",
      });
    }

    const existingSession = await prisma.usageSession.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!existingSession) {
      return res.status(404).json({
        success: false,
        message: "Usage session not found",
      });
    }

    if (existingSession.endTime) {
      return res.status(400).json({
        success: false,
        message: "Cannot update a completed session",
      });
    }

    const session = await prisma.usageSession.update({
      where: {
        id: String(req.params.id),
      },
      data: {
        dataUsedMb: Number(dataUsedMb),
      },
    });

    return res.json({
      success: true,
      message: "Usage updated successfully",
      session,
    });
  } catch (error) {
    console.error("Update usage error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update usage",
    });
  }
});

// END usage session
router.patch("/:id/end", authenticate, async (req, res) => {
  try {
    const existingSession = await prisma.usageSession.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!existingSession) {
      return res.status(404).json({
        success: false,
        message: "Usage session not found",
      });
    }

    if (existingSession.endTime) {
      return res.status(400).json({
        success: false,
        message: "Session has already ended",
      });
    }

    const session = await prisma.usageSession.update({
      where: {
        id: String(req.params.id),
      },
      data: {
        endTime: new Date(),
      },
    });

    return res.json({
      success: true,
      message: "Usage session ended",
      session,
    });
  } catch (error) {
    console.error("End session error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to end usage session",
    });
  }
});

export default router;

