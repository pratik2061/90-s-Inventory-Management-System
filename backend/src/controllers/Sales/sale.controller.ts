import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export const salesController = {
  // Create a new sale
  createSale: async (req: Request, res: Response) => {
    try {
      const { customerId, paymentMode, items, note } = req.body;

      // Validate required fields
      if (!paymentMode || !items || items.length === 0) {
        return res.status(400).json({
          message: "Payment mode and items are required",
        });
      }

      // Calculate total amount and validate items
      let totalAmount = 0;
      const itemsToCreate = [] as Array<{
        itemId: string;
        quantity: number;
        price: number;
      }>;

      for (const item of items) {
        const dbItem = await prisma.item.findUnique({
          where: { id: item.itemId },
        });

        if (!dbItem) {
          return res.status(404).json({
            message: `Item with id ${item.itemId} not found`,
          });
        }

        if (dbItem.quantity < item.quantity) {
          return res.status(400).json({
            message: `Insufficient quantity for item ${dbItem.name}. Available: ${dbItem.quantity}`,
          });
        }

        totalAmount += dbItem.price * item.quantity;
        itemsToCreate.push({
          itemId: item.itemId,
          quantity: item.quantity,
          price: dbItem.price,
        });
      }

      // Create sale with items in a transaction
      const sale = await prisma.$transaction(async (tx) => {
        // Create the sale
        const newSale = await tx.sale.create({
          data: {
            customerId: customerId || null,
            paymentMode,
            totalAmount,
            note: note || null,
            items: {
              create: itemsToCreate,
            },
          },
          include: {
            items: {
              include: {
                item: true,
              },
            },
            customer: true,
          },
        });

        // Update item quantities
        for (const item of items) {
          await tx.item.update({
            where: { id: item.itemId },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        }

        return newSale;
      });

      res.status(201).json({
        message: "Sale created successfully",
        data: sale,
      });
    } catch (error) {
      console.error("Create sale error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  getAllSales: async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        customerId,
        paymentMode,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {};

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      if (customerId) where.customerId = customerId;
      if (paymentMode) where.paymentMode = paymentMode;

      const [sales, totalCount] = await Promise.all([
        prisma.sale.findMany({
          where,
          skip,
          take,
          include: {
            items: {
              include: {
                item: true,
              },
            },
            customer: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.sale.count({ where }),
      ]);

      const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

      res.status(200).json({
        message: "Sales fetched successfully",
        data: sales,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalCount,
          totalPages: Math.ceil(totalCount / Number(limit)),
        },
        totalSales,
      });
    } catch (error) {
      console.error("Get all sales error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  // Get sale by ID
  getSaleById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      const sale = await prisma.sale.findUnique({
        where: { id: String(id) },
        include: {
          items: {
            include: {
              item: true,
            },
          },
          customer: true,
        },
      });

      if (!sale) {
        return res.status(404).json({
          message: "Sale not found",
        });
      }

      res.status(200).json({
        message: "Sale fetched successfully",
        data: sale,
      });
    } catch (error) {
      console.error("Get sale by ID error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  // Update sale (limited fields - only note and payment mode can be updated)
  updateSale: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { note, paymentMode } = req.body;

      const existingSale = await prisma.sale.findUnique({
        where: { id: String(id) },
      });

      if (!existingSale) {
        return res.status(404).json({
          message: "Sale not found",
        });
      }

      const updatedSale = await prisma.sale.update({
        where: { id: String(id) },
        data: {
          note: note !== undefined ? note : existingSale.note,
          paymentMode: paymentMode || existingSale.paymentMode,
        },
        include: {
          items: {
            include: {
              item: true,
            },
          },
          customer: true,
        },
      });

      res.status(200).json({
        message: "Sale updated successfully",
        data: updatedSale,
      });
    } catch (error) {
      console.error("Update sale error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  // Get sales statistics
  getSalesStats: async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;

      const where: any = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      const [totalSales, salesByPaymentMode] = await Promise.all([
        prisma.sale.aggregate({
          where,
          _sum: {
            totalAmount: true,
          },
          _count: true,
        }),
        prisma.sale.groupBy({
          by: ["paymentMode"],
          where,
          _sum: {
            totalAmount: true,
          },
          _count: true,
        }),
      ]);

      res.status(200).json({
        message: "Sales statistics fetched successfully",
        data: {
          totalRevenue: totalSales._sum.totalAmount || 0,
          totalTransactions: totalSales._count,
          byPaymentMode: salesByPaymentMode,
        },
      });
    } catch (error) {
      console.error("Get sales stats error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
};
