import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { prisma } from "../utils/prisma.js";

const router = Router();

router.get("/", authenticate, async (_req, res) => {
  try {
    const [
      totalHotspots,
      onlineHotspots,
      offlineHotspots,
      maintenanceHotspots,
      totalUsers,
      activeUsers,
      blockedUsers,
      activeSessions,
      totalVouchers,
      activeVouchers,
      usedVouchers,
      expiredVouchers,
      disabledVouchers,
      usageResult,
      recentSecurityEvents,
      recentLogins,
    ] = await Promise.all([
      prisma.hotspot.count(),

      prisma.hotspot.count({
        where: { status: "ONLINE" },
      }),

      prisma.hotspot.count({
        where: { status: "OFFLINE" },
      }),

      prisma.hotspot.count({
        where: { status: "MAINTENANCE" },
      }),

      prisma.wifiUser.count(),

      prisma.wifiUser.count({
        where: { status: "ACTIVE" },
      }),

      prisma.wifiUser.count({
        where: { status: "BLOCKED" },
      }),

      prisma.usageSession.count({
        where: { endTime: null },
      }),

      prisma.voucher.count(),

      prisma.voucher.count({
        where: { status: "ACTIVE" },
      }),

      prisma.voucher.count({
        where: { status: "USED" },
      }),

      prisma.voucher.count({
        where: { status: "EXPIRED" },
      }),

      prisma.voucher.count({
        where: { status: "DISABLED" },
      }),

      prisma.usageSession.aggregate({
        _sum: {
          dataUsedMb: true,
        },
      }),

      prisma.securityEvent.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),

      prisma.loginAudit.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        select: {
          id: true,
          email: true,
          ipAddress: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return res.json({
      success: true,

      overview: {
        totalHotspots,
        onlineHotspots,
        offlineHotspots,
        maintenanceHotspots,

        totalUsers,
        activeUsers,
        blockedUsers,

        activeSessions,

        totalDataUsedMb: usageResult._sum.dataUsedMb ?? 0,

        totalVouchers,
        activeVouchers,
        usedVouchers,
        expiredVouchers,
        disabledVouchers,
      },

      recentSecurityEvents,

      recentLogins,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard analytics",
    });
  }
});

export default router;

