import { Request, Response } from "express";
import { verifyToken } from "../utils/verifyToken";

export const checkToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(400).json({
        status: false,
        message: "No token found",
      });
    } else {
      const checkToken = verifyToken(token);
      if (!checkToken) {
        res.status(400).json({
          status: false,
          message: "Invalid token, please re-login",
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Token found ",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
