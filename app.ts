import bodyParser from "body-parser";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { router as menuScheduleRouter } from "./app/routes/menuSchedules";

const app: Application = express();
const port = 8888;
app.use(bodyParser.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "healthy" });
});
app.use("/api/menuSchedules", menuScheduleRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
