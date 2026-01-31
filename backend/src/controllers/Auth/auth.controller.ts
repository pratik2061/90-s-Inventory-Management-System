import { Request, Response } from "express";
import { createToken } from "../../utils/createToken";

export const loginController = (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const adminCredentials = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    if (!username || !password) {
      res.status(400).json({
        message: "Username or Password are required",
      });
    } else if (
      username !== adminCredentials.username ||
      password !== adminCredentials.password
    ) {
      res.status(400).json({
        message: "Inavlid credentials",
      });
    } else {
      const token = createToken();
      res.cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(200).json({ message: "Login successful" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutController = (req: Request, res: Response) => {
  try {
    const checkToken = req.cookies.token;
    if (!checkToken) {
      res.status(400).json({
        message: "Token missing,login first",
      });
    } else {
      res.clearCookie("token", {
        httpOnly: true,
      });
      res.status(200).json({
        message: "Logout Successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
