import { response } from "express";
import jwt from "jsonwebtoken";
export const verifyToken = (token: string) => {
  const result = jwt.verify(token, `${process.env.SECRET_KEY}`) as {
    purpose: string;
  };
  if (result.purpose == process.env.PAYLOAD) {
    return true;
  } else {
    response.status(400).json({
      message: "Invalid token",
    });
  }
};
