import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export const exchangedItemsController = {
  // Create a new exchange
  createExchange: async (req: Request, res: Response) => {
    try {
      const { customerId, originalItemId, newItemId, quantity, note, saleId } =
        req.body;

      // Validate required fields
      if (!customerId || !originalItemId || !newItemId || !quantity) {
        return res.status(400).json({
          message:
            "Customer ID, original item ID, new item ID, and quantity are required",
        });
      }

      // Validate customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        return res.status(404).json({
          message: "Customer not found",
        });
      }

      // Validate items exist
      const [originalItem, newItem] = await Promise.all([
        prisma.item.findUnique({ where: { id: originalItemId } }),
        prisma.item.findUnique({ where: { id: newItemId } }),
      ]);

      if (!originalItem || !newItem) {
        return res.status(404).json({
          message: "Item not found",
        });
      }

      // Check if new item has sufficient stock
      if (newItem.quantity < quantity) {
        return res.status(400).json({
          message: `Insufficient quantity for new item ${newItem.name}. Available: ${newItem.quantity}`,
        });
      }

      // Validate sale and saleItem if saleId is provided
      if (saleId) {
        const sale = await prisma.sale.findUnique({
          where: { id: saleId },
          include: { items: true },
        });

        if (!sale) {
          return res.status(404).json({ message: "Sale not found" });
        }

        const saleItem = sale.items.find((si) => si.itemId === originalItemId);
        if (!saleItem || saleItem.quantity < quantity) {
          return res.status(400).json({
            message: "Invalid original item or quantity for this sale",
          });
        }
      }

      // Create exchange and update everything in a transaction
      const exchange = await prisma.$transaction(async (tx) => {
        // 1. Create the exchange record
        const newExchange = await tx.exchangedItem.create({
          data: {
            customerId,
            saleId: saleId || null,
            originalItemId,
            newItemId,
            quantity,
            note: note || null,
          },
          include: {
            customer: true,
            originalItem: true,
            newItem: true,
          },
        });

        // 2. Restore original item inventory quantity (Received back)
        await tx.item.update({
          where: { id: originalItemId },
          data: {
            quantity: {
              increment: quantity,
            },
          },
        });

        // 3. Deduct new item inventory quantity
        await tx.item.update({
          where: { id: newItemId },
          data: {
            quantity: {
              decrement: quantity,
            },
          },
        });

        // 4. Update Sale and SaleItems if linked to a sale
        if (saleId) {
          // Decrement original sale item quantity
          const originalSaleItem = await tx.saleItem.findFirst({
            where: { saleId, itemId: originalItemId },
          });

          if (originalSaleItem) {
            if (originalSaleItem.quantity === quantity) {
              await tx.saleItem.delete({ where: { id: originalSaleItem.id } });
            } else {
              await tx.saleItem.update({
                where: { id: originalSaleItem.id },
                data: { quantity: { decrement: quantity } },
              });
            }

            // Update Sale total amount
            const priceDifference =
              (newItem.price - originalSaleItem.price) * quantity;
            await tx.sale.update({
              where: { id: saleId },
              data: {
                totalAmount: {
                  increment: priceDifference,
                },
              },
            });
          }

          // Add or update new sale item
          const existingNewItem = await tx.saleItem.findFirst({
            where: { saleId, itemId: newItemId },
          });

          if (existingNewItem) {
            await tx.saleItem.update({
              where: { id: existingNewItem.id },
              data: { quantity: { increment: quantity } },
            });
          } else {
            await tx.saleItem.create({
              data: {
                saleId,
                itemId: newItemId,
                quantity: quantity,
                price: newItem.price,
              },
            });
          }
        }

        return newExchange;
      });

      res.status(201).json({
        message: "Exchange created successfully",
        data: exchange,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  // Get all exchanges with optional filters
  getAllExchanges: async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        customerId,
        saleId,
        startDate,
        endDate,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build where clause
      const where: any = {};

      if (customerId) where.customerId = customerId;
      if (saleId) where.saleId = saleId;

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      const [exchanges, totalCount] = await Promise.all([
        prisma.exchangedItem.findMany({
          where,
          skip,
          take,
          include: {
            customer: true,
            originalItem: true,
            newItem: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.exchangedItem.count({ where }),
      ]);

      res.status(200).json({
        message: "Exchanges fetched successfully",
        data: exchanges,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalCount,
          totalPages: Math.ceil(totalCount / Number(limit)),
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  // Get exchange by ID
  getExchangeById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const exchange = await prisma.exchangedItem.findUnique({
        where: { id: String(id) },
        include: {
          customer: true,
          originalItem: true,
          newItem: true,
        },
      });

      if (!exchange) {
        return res.status(404).json({
          message: "Exchange not found",
        });
      }

      res.status(200).json({
        message: "Exchange fetched successfully",
        data: exchange,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  // Update exchange (only note can be updated)
  updateExchange: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { note } = req.body;

      const existingExchange = await prisma.exchangedItem.findUnique({
        where: { id: String(id) },
      });

      if (!existingExchange) {
        return res.status(404).json({
          message: "Exchange not found",
        });
      }

      const updatedExchange = await prisma.exchangedItem.update({
        where: { id: String(id) },
        data: {
          note: note !== undefined ? note : existingExchange.note,
        },
        include: {
          customer: true,
          originalItem: true,
          newItem: true,
        },
      });

      res.status(200).json({
        message: "Exchange updated successfully",
        data: updatedExchange,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  // Delete exchange (reverses the inventory changes)
  deleteExchange: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const existingExchange = await prisma.exchangedItem.findUnique({
        where: { id: String(id) },
      });

      if (!existingExchange) {
        return res.status(404).json({
          message: "Exchange not found",
        });
      }

      // Delete exchange and reverse inventory changes in a transaction
      await prisma.$transaction(async (tx) => {
        // Delete the exchange record
        await tx.exchangedItem.delete({
          where: { id: String(id) },
        });

        // Reverse: Deduct original item quantity
        await tx.item.update({
          where: { id: existingExchange.originalItemId },
          data: {
            quantity: {
              decrement: existingExchange.quantity,
            },
          },
        });

        // Reverse: Restore new item quantity
        await tx.item.update({
          where: { id: existingExchange.newItemId },
          data: {
            quantity: {
              increment: existingExchange.quantity,
            },
          },
        });
      });

      res.status(200).json({
        message: "Exchange deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  // Get exchange statistics
  getExchangeStats: async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;

      const where: any = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      const [totalExchanges, topExchangedItems] = await Promise.all([
        prisma.exchangedItem.count({ where }),
        prisma.exchangedItem.groupBy({
          by: ["originalItemId"],
          where,
          _count: true,
          _sum: {
            quantity: true,
          },
          orderBy: {
            _count: {
              originalItemId: "desc",
            },
          },
          take: 10,
        }),
      ]);

      // Get item details for top exchanged items
      const itemIds = topExchangedItems.map((item) => item.originalItemId);
      const items = await prisma.item.findMany({
        where: {
          id: { in: itemIds },
        },
      });

      const topExchangedWithDetails = topExchangedItems.map((exchange) => {
        const item = items.find((i) => i.id === exchange.originalItemId);
        return {
          item,
          exchangeCount: exchange._count,
          totalQuantity: exchange._sum.quantity,
        };
      });

      res.status(200).json({
        message: "Exchange statistics fetched successfully",
        data: {
          totalExchanges,
          topExchangedItems: topExchangedWithDetails,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
};
