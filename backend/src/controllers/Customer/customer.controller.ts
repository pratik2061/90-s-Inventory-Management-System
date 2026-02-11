import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export const customersController = {
  // Create a new customer
  createCustomer: async (req: Request, res: Response) => {
    try {
      const { name, phone } = req.body;

      // Validate required fields
      if (!name || !phone) {
        return res.status(400).json({
          message: "Name and phone are required",
        });
      }

      const customer = await prisma.customer.create({
        data: {
          name,
          phone,
        },
      });

      res.status(201).json({
        message: "Customer created successfully",
        data: customer,
      });
    } catch (error) {
      console.error("Create customer error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  // Get all customers with optional filters
  getAllCustomers: async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: "insensitive" } },
          { phone: { contains: search as string, mode: "insensitive" } },
        ];
      }

      const [customers, totalCount] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip,
          take,
          include: {
            _count: {
              select: {
                sales: true,
                exchangedItems: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.customer.count({ where }),
      ]);

      res.status(200).json({
        message: "Customers fetched successfully",
        data: customers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalCount,
          totalPages: Math.ceil(totalCount / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Get all customers error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  // Get customer by ID
  getCustomerById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const customer = await prisma.customer.findUnique({
        where: { id: String(id) },
        include: {
          sales: {
            include: {
              items: {
                include: {
                  item: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          exchangedItems: {
            include: {
              originalItem: true,
              newItem: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!customer) {
        return res.status(404).json({
          message: "Customer not found",
        });
      }

      // Calculate total purchases
      const totalPurchases = customer.sales.reduce(
        (sum, sale) => sum + sale.totalAmount,
        0,
      );

      res.status(200).json({
        message: "Customer fetched successfully",
        data: {
          ...customer,
          totalPurchases,
        },
      });
    } catch (error) {
      console.error("Get customer by ID error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  // Update customer
  updateCustomer: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, phone } = req.body;

      const existingCustomer = await prisma.customer.findUnique({
        where: { id: String(id) },
      });

      if (!existingCustomer) {
        return res.status(404).json({
          message: "Customer not found",
        });
      }

      // Check if phone is being changed and already exists
      if (phone && phone !== existingCustomer.phone) {
        const phoneExists = await prisma.customer.findFirst({
          where: {
            phone,
            id: { not: String(id) },
          },
        });

        if (phoneExists) {
          return res.status(400).json({
            message: "Customer with this phone number already exists",
          });
        }
      }

      const updatedCustomer = await prisma.customer.update({
        where: { id: String(id) },
        data: {
          name: name || existingCustomer.name,
          phone: phone || existingCustomer.phone,
        },
      });

      res.status(200).json({
        message: "Customer updated successfully",
        data: updatedCustomer,
      });
    } catch (error) {
      console.error("Update customer error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  // Delete customer
  deleteCustomer: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const existingCustomer = await prisma.customer.findUnique({
        where: { id: String(id) },
        include: {
          sales: true,
          exchangedItems: true,
        },
      });

      if (!existingCustomer) {
        return res.status(404).json({
          message: "Customer not found",
        });
      }

      // Check if customer has related records
      if (
        existingCustomer.sales.length > 0 ||
        existingCustomer.exchangedItems.length > 0
      ) {
        return res.status(400).json({
          message:
            "Cannot delete customer with existing sales or exchange records",
        });
      }

      await prisma.customer.delete({
        where: { id: String(id) },
      });

      res.status(200).json({
        message: "Customer deleted successfully",
      });
    } catch (error) {
      console.error("Delete customer error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  // Get customer purchase history
  getCustomerPurchaseHistory: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const where: any = { customerId: id };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      const sales = await prisma.sale.findMany({
        where,
        include: {
          items: {
            include: {
              item: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const totalSpent = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

      res.status(200).json({
        message: "Customer purchase history fetched successfully",
        data: {
          sales,
          totalSpent,
          totalTransactions: sales.length,
        },
      });
    } catch (error) {
      console.error("Get customer purchase history error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
};
