import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export const itemsController = {
  getAllItems: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const skip = (page - 1) * limit;

      const allItems = await prisma.item.findMany();

      let allQuantity = 0;
      allItems.map((data) => (allQuantity = data.quantity + allQuantity));

      const [items, totalCount] = await Promise.all([
        prisma.item.findMany({
          skip: skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.item.count(),
      ]);
      if (items.length === 0 && page === 1) {
        return res.status(404).json({
          message: "No items found in inventory",
          data: [],
        });
      }

      // 4. Return data along with pagination metadata
      return res.status(200).json({
        message: "Items fetched successfully",
        data: items,
        pagination: {
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          itemsPerPage: limit,
        },
        totalItemsInAllPages: allItems.length,
        allQuantity,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  getOneItem: async (req: Request, res: Response) => {
    try {
      const itemId = req.params.id;
      const checkItem = await prisma.item.findUnique({
        where: {
          id: String(itemId),
        },
      });
      if (!checkItem) {
        res.status(400).json({
          message: "No items found",
        });
      } else {
        res.status(200).json({
          message: "Item fetched successfully",
          data: checkItem,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  addItems: async (req: Request, res: Response) => {
    try {
      const { name, code, price, colors, quantity } = req.body;
      if (!name || !code || !price || !colors || !quantity) {
        res.status(400).json({
          message: "All fields are required",
        });
      } else {
        const createItem = await prisma.item.create({
          data: {
            name,
            code,
            price,
            colors,
            quantity,
          },
        });
        if (!createItem) {
          res.status(400).json({
            message: "Failed to create an item",
          });
        } else {
          res.status(200).json({
            message: "Item added successfully",
          });
        }
      }
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  searchItem: async (req: Request, res: Response) => {
    try {
      const { searchterm } = req.query;
      const term = String(searchterm).trim();

      const allItems = await prisma.item.findMany();

      let allQuantity = 0;
      allItems.map((data) => (allQuantity = data.quantity + allQuantity));

      if (!searchterm) {
        return res.status(400).json({
          message: "Search term missing",
        });
      }

      // Use findMany to return a list of matches
      const foundItems = await prisma.item.findMany({
        where: {
          OR: [
            {
              code: {
                contains: term,
                mode: "insensitive",
              },
            },
            {
              name: {
                contains: term,
                mode: "insensitive",
              },
            },
          ],
        },
      });

      if (foundItems.length === 0) {
        return res.status(404).json({
          message: "No Items found",
          data: [], // Return empty array to keep frontend stable
        });
      }

      res.status(200).json({
        message: "Search items found",
        data: foundItems,
        totalItemsInAllPages: allItems.length,
        allQuantity,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  updateItems: async (req: Request, res: Response) => {
    try {
      const itemId = req.params.id;

      // 1. Verify item exists
      const checkItem = await prisma.item.findUnique({
        where: { id: String(itemId) },
      });

      if (!checkItem) {
        return res.status(404).json({ message: "No item found" });
      }

      const { name, price, colors, quantity, code } = req.body;

      // 2. Validation
      if (
        !name ||
        price === undefined ||
        !colors ||
        quantity === undefined ||
        !code
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // 3. Perform update
      await prisma.item.update({
        where: { id: String(itemId) },
        data: { name, code, price, colors, quantity },
      });

      return res.status(200).json({ message: "Item updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server Error" });
    }
  },
  deleteItems: async (req: Request, res: Response) => {
    try {
      const itemId = req.params.id;
      const checkItem = await prisma.item.findUnique({
        where: {
          id: String(itemId),
        },
      });
      if (!checkItem) {
        res.status(400).json({
          message: "No items found to delete",
        });
      } else {
        await prisma.item.delete({
          where: {
            id: String(itemId),
          },
        });
        res.status(200).json({
          message: "Items delete successfully",
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
};
