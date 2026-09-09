import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import { router as ingredientRouter } from "./app/routes/ingredients";
import { router as menuScheduleRouter } from "./app/routes/menuSchedules";
import { router as menuRouter } from "./app/routes/menus";

const app: Application = express();
const port = 8888;
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
	res.json({ status: "healthy" });
});
app.use("/api/menuSchedules", menuScheduleRouter);
app.use("/api/menus", menuRouter);
app.use("/api/ingredients", ingredientRouter);

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
