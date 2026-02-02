import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export const itemsController = {
  getAllItems: async (req: Request, res: Response) => {
    try {
      const findAllItems = await prisma.item.findMany();
      if (findAllItems.length === 0) {
        res.status(400).json({
          message: "No any items to show",
        });
      } else {
        res.status(200).json({
          message: "Items fetched Sucessfully",
          data: findAllItems,
        });
      }
    } catch (error) {
      res.status(500).json({
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
      const searchterm = req.query.searchterm as string;
      if (!searchterm) {
        res.status(400).json({
          message: "Search term missing",
        });
      }
      const findItem = await prisma.item.findUnique({
        where: {
          code: searchterm,
        },
      });
      if (!findItem) {
        res.status(400).json({
          message: "No Items found",
        });
      } else {
        res.status(200).json({
          message: "Search item found",
          data: findItem,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  updateItems: async (req: Request, res: Response) => {
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
        const { name, price, colors, quantity, code } = req.body;
        if (!name || !price || !colors || !quantity || !code) {
          res.status(400).json({
            message: "All fields are required to be filled",
          });
        }
        const checkCode = await prisma.item.findMany({
          where: {
            code: code,
          },
        });
        if (checkCode.length > 0) {
          res.status(400).json({
            messgae: "Error , code already exits.Try searching item",
          });
        } else {
          await prisma.item.update({
            where: {
              id: String(itemId),
            },
            data: {
              name,
              code,
              price,
              colors,
              quantity,
            },
          });
          res.status(200).json({
            message: "Item updated successfully",
          });
        }
      }
    } catch (error) {
      res.status(500).json({
        message: "Internal server Error",
      });
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
