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
  
};
