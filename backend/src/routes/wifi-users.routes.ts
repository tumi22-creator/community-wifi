import { Router } from "express";
import { prisma } from "../utils/prisma.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// GET all WiFi users
router.get("/", authenticate, async (_req, res) => {
  try {
    const users = await prisma.wifiUser.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
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
      users,
    });
  } catch (error) {
    console.error("Get WiFi users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch WiFi users",
    });
  }
});

// GET one WiFi user
router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = await prisma.wifiUser.findUnique({
      where: {
        id: String(req.params.id),
      },
      include: {
        hotspot: true,
        sessions: {
          orderBy: {
            startTime: "desc",
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "WiFi user not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get WiFi user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch WiFi user",
    });
  }
});

// CREATE WiFi user
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, email, device, hotspotId } = req.body;

    if (!name || !hotspotId) {
      return res.status(400).json({
        success: false,
        message: "Name and hotspotId are required",
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

    const user = await prisma.wifiUser.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        device: device?.trim() || null,
        hotspotId,
      },
      include: {
        hotspot: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "WiFi user created successfully",
      user,
    });
  } catch (error) {
    console.error("Create WiFi user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create WiFi user",
    });
  }
});

// UPDATE WiFi user
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { name, email, device, status } = req.body;

    const existingUser = await prisma.wifiUser.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "WiFi user not found",
      });
    }

    const user = await prisma.wifiUser.update({
      where: {
        id: String(req.params.id),
      },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(device !== undefined && {
          device: device?.trim() || null,
        }),
        ...(status !== undefined && { status }),
      },
    });

    return res.json({
      success: true,
      message: "WiFi user updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update WiFi user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update WiFi user",
    });
  }
});

// BLOCK WiFi user
router.patch("/:id/block", authenticate, async (req, res) => {
  try {
    const user = await prisma.wifiUser.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "WiFi user not found",
      });
    }

    const updatedUser = await prisma.wifiUser.update({
      where: {
        id: String(req.params.id),
      },
      data: {
        status: "BLOCKED",
      },
    });

    return res.json({
      success: true,
      message: "WiFi user blocked successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Block WiFi user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to block WiFi user",
    });
  }
});

// UNBLOCK WiFi user
router.patch("/:id/unblock", authenticate, async (req, res) => {
  try {
    const user = await prisma.wifiUser.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "WiFi user not found",
      });
    }

    const updatedUser = await prisma.wifiUser.update({
      where: {
        id: String(req.params.id),
      },
      data: {
        status: "ACTIVE",
      },
    });

    return res.json({
      success: true,
      message: "WiFi user unblocked successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Unblock WiFi user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to unblock WiFi user",
    });
  }
});

// DELETE WiFi user
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const user = await prisma.wifiUser.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "WiFi user not found",
      });
    }

    await prisma.wifiUser.delete({
      where: {
        id: String(req.params.id),
      },
    });

    return res.json({
      success: true,
      message: "WiFi user deleted successfully",
    });
  } catch (error) {
    console.error("Delete WiFi user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete WiFi user",
    });
  }
});

export default router;

