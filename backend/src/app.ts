import "dotenv/config";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import route from "./routes/index.route";
import cors from "cors";
import path from "path"

const app = express();
const PORT = process.env.PORT ?? 4001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api", route);

app.use(
  express.static(
    path.join(__dirname, "../../frontend/dist")
  )
)
app.get(/.*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/dist/index.html")
  );
});


// app.get("/", (req: Request, res: Response) => {
//   res.send("hi this is from 90's backend");
// });

app.listen(PORT);
