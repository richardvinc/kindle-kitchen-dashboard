import { type Request, type Response, Router } from "express";
import {
	addMenus,
	findMenusByKeyword,
	getAll,
	removeMenu,
	updateMenu,
} from "../repositories/menus";

export const router = Router();

router.get("/", async (_req: Request, res: Response) => {
	return res.json(await getAll());
});

router.get("/find", async (req: Request, res: Response) => {
	const keyword = req.query.keyword;
	if (!keyword) res.json(null);

	return res.json(await findMenusByKeyword(keyword as string));
});

router.post("/", async (req: Request, res: Response) => {
	const obj = req.body;

	return res.json(await addMenus(obj));
});

router.put("/:id", async (req: Request, res: Response) => {
	const id = Number(req.params.id);
	if (!Number.isInteger(id))
		return res.status(400).json({ error: "Invalid menu id" });

	return res.json(await updateMenu(id, req.body));
});

router.delete("/:id", async (req: Request, res: Response) => {
	const id = Number(req.params.id);
	if (!Number.isInteger(id))
		return res.status(400).json({ error: "Invalid menu id" });

	return res.json(await removeMenu(id));
});
