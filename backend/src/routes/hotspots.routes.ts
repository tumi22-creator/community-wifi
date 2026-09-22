import { Router } from "express";
import { prisma } from "../utils/prisma.js";
import { authenticate, AuthRequest } from "../middleware/auth.middleware.js";

const router = Router();

// GET all hotspots
router.get("/", authenticate, async (_req: AuthRequest, res) => {
  try {
    const hotspots = await prisma.hotspot.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      hotspots,
    });
  } catch (error) {
    console.error("Get hotspots error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hotspots",
    });
  }
});

// GET one hotspot
router.get("/:id", authenticate, async (req, res) => {
  try {
    const hotspot = await prisma.hotspot.findUnique({
      where: {
        id: String(req.params.id),
      },
      include: {
        vouchers: true,
        wifiUsers: true,
        sessions: true,
      },
    });

    if (!hotspot) {
      return res.status(404).json({
        success: false,
        message: "Hotspot not found",
      });
    }

    return res.json({
      success: true,
      hotspot,
    });
  } catch (error) {
    console.error("Get hotspot error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hotspot",
    });
  }
});

// CREATE hotspot
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, location, maxUsers } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: "Name and location are required",
      });
    }

    const hotspot = await prisma.hotspot.create({
      data: {
        name: name.trim(),
        location: location.trim(),
        maxUsers: maxUsers || 50,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Hotspot created successfully",
      hotspot,
    });
  } catch (error) {
    console.error("Create hotspot error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create hotspot",
    });
  }
});

// UPDATE hotspot
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { name, location, status, maxUsers } = req.body;

    const hotspot = await prisma.hotspot.update({
      where: {
        id: String(req.params.id),
      },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(location !== undefined && { location: location.trim() }),
        ...(status !== undefined && { status }),
        ...(maxUsers !== undefined && { maxUsers }),
      },
    });

    return res.json({
      success: true,
      message: "Hotspot updated successfully",
      hotspot,
    });
  } catch (error) {
    console.error("Update hotspot error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update hotspot",
    });
  }
});

// DELETE hotspot
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const hotspot = await prisma.hotspot.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!hotspot) {
      return res.status(404).json({
        success: false,
        message: "Hotspot not found",
      });
    }

    await prisma.hotspot.delete({
      where: {
        id: String(req.params.id),
      },
    });

    return res.json({
      success: true,
      message: "Hotspot deleted successfully",
    });
  } catch (error) {
    console.error("Delete hotspot error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete hotspot",
    });
  }
});

export default router;

