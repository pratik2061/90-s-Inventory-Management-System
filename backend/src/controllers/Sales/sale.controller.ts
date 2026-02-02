import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export const salesController = {
  getAllSales: async (req: Request, res: Response) => {
    try {
      const getSales = await prisma.sale.findMany();
      let totalSales = 0;
      if (getSales.length == 0) {
        res.status(400).json({
          message: "No any sales available",
          totalSales,
        });
      } else {
        res.status(200).json({
          message: "Sales fetched without page and limit and range of date ",
          totalSales,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  
};
