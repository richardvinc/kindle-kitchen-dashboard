import path from "node:path";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";

import { router as ingredientRouter } from "./app/routes/ingredients";
import { router as menuScheduleRouter } from "./app/routes/menuSchedules";
import { router as menuRouter } from "./app/routes/menus";

const app: Application = express();
const port = Number(process.env.PORT ?? 8888);
const host = process.env.HOST ?? "0.0.0.0";
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
	res.json({ status: "healthy" });
});
app.use("/api/menuSchedules", menuScheduleRouter);
app.use("/api/menus", menuRouter);
app.use("/api/ingredients", ingredientRouter);

app.use(express.static(path.join(import.meta.dir, "app/ui/dist")));
app.get("/{*splat}", (_req: Request, res: Response) => {
	res.sendFile(path.join(import.meta.dir, "app/ui/dist/index.html"));
});

app.listen(port, host, () => {
	console.log(`Server listening on http://${host}:${port}`);
});
