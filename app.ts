import bodyParser from "body-parser";
import express, { type Application } from "express";
import { router as menuScheduleRouter } from "./app/routes/menuSchedules";

const app: Application = express();
const port = 8888;
app.use(bodyParser.json());
app.use("/menuSchedules", menuScheduleRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
