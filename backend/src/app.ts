import "dotenv/config";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import route from "./routes/index.route";

const app = express();
const PORT = process.env.PORT ?? 4001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api',route);

app.get("/", (req: Request, res: Response) => {
  res.send("hi this is from 90's backend");
});

app.listen(PORT, () => {
  console.log("server running on port = ", PORT);
});
