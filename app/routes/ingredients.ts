import { type Request, type Response, Router } from "express";
import {
	addIngredient,
	findIngredientsByKeyword,
	getAll,
} from "../repositories/ingredients";

export const router = Router();

router.get("/", async (_req: Request, res: Response) => {
	return res.json(await getAll());
});

router.get("/find", async (req: Request, res: Response) => {
	const keyword = req.query.keyword;
	if (!keyword) res.json(null);

	return res.json(await findIngredientsByKeyword(keyword as string));
});

router.post("/", async (req: Request, res: Response) => {
	const obj = req.body;

	return res.json(await addIngredient(obj));
});
