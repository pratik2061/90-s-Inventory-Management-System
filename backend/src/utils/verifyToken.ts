import { response } from "express";
import jwt from "jsonwebtoken";
export const verifyToken = (token: string) => {
  try {
    const result = jwt.verify(token, `${process.env.SECRET_KEY}`) as {
      purpose: string;
    };
    if (result.purpose == process.env.PAYLOAD) {
      return true;
    }
  } catch (error) {
    return false;
  }
};
