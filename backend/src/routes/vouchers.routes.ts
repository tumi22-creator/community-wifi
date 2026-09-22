import { Router } from "express";
import { prisma } from "../utils/prisma.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

function generateVoucherCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

// GET all vouchers
router.get("/", authenticate, async (_req, res) => {
  try {
    const vouchers = await prisma.voucher.findMany({
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
      vouchers,
    });
  } catch (error) {
    console.error("Get vouchers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vouchers",
    });
  }
});

// GET one voucher
router.get("/:id", authenticate, async (req, res) => {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: {
        id: String(req.params.id),
      },
      include: {
        hotspot: true,
      },
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    return res.json({
      success: true,
      voucher,
    });
  } catch (error) {
    console.error("Get voucher error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch voucher",
    });
  }
});

// CREATE voucher
router.post("/", authenticate, async (req, res) => {
  try {
    const { duration, hotspotId } = req.body;

    if (!duration || !hotspotId) {
      return res.status(400).json({
        success: false,
        message: "Duration and hotspotId are required",
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

    let code = generateVoucherCode();

    while (
      await prisma.voucher.findUnique({
        where: { code },
      })
    ) {
      code = generateVoucherCode();
    }

    const expiresAt = new Date(
      Date.now() + Number(duration) * 60 * 60 * 1000
    );

    const voucher = await prisma.voucher.create({
      data: {
        code,
        duration: Number(duration),
        expiresAt,
        hotspotId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Voucher created successfully",
      voucher,
    });
  } catch (error) {
    console.error("Create voucher error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create voucher",
    });
  }
});

// DISABLE voucher
router.patch("/:id/disable", authenticate, async (req, res) => {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    const updatedVoucher = await prisma.voucher.update({
      where: {
        id: String(req.params.id),
      },
      data: {
        status: "DISABLED",
      },
    });

    return res.json({
      success: true,
      message: "Voucher disabled successfully",
      voucher: updatedVoucher,
    });
  } catch (error) {
    console.error("Disable voucher error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to disable voucher",
    });
  }
});

// DELETE voucher
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    await prisma.voucher.delete({
      where: {
        id: String(req.params.id),
      },
    });

    return res.json({
      success: true,
      message: "Voucher deleted successfully",
    });
  } catch (error) {
    console.error("Delete voucher error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete voucher",
    });
  }
});

export default router;

