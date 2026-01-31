import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/verifyToken";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({
        message: "Token not found , please login first",
      });
    } else {
      const checkToken = verifyToken(token);
      if (!checkToken) {
        res.status(400).json({
          message: "Invalid Token.",
        });
      } else {
        next();
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
