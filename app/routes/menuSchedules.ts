import { type Request, type Response, Router } from "express";
import { getDateGMT7 } from "../helpers";
import {
	addMenuToDate,
	findNextWeekMenus,
	findThisWeekMenus,
	getDetailedMenuByDate,
	removeSchedule,
} from "../repositories/menuSchedules";
export const router = Router();

router.get("/today", async (_req: Request, res: Response) => {
	const today = getDateGMT7();
	return res.json(await getDetailedMenuByDate(today));
});

router.get("/tomorrow", async (_req: Request, res: Response) => {
	const tomorrow = getDateGMT7(1);
	return res.json(await getDetailedMenuByDate(tomorrow));
});

router.get("/week", async (_req: Request, res: Response) => {
	const today = getDateGMT7();
	return res.json(await findThisWeekMenus(today));
});

router.get("/next-week", async (_req: Request, res: Response) => {
	const today = getDateGMT7();
	return res.json(await findNextWeekMenus(today));
});

router.post("/", async (req: Request, res: Response) => {
	const obj = req.body;

	return res.json(await addMenuToDate(obj));
});

router.delete("/:date", async (req: Request, res: Response) => {
	const date = req.params.date;
	if (typeof date !== "string")
		return res.status(400).json({ error: "Invalid schedule date" });

	return res.json(await removeSchedule(date));
});
