import { type Request, type Response, Router } from "express";
import { getDateGMT7 } from "../helpers";
import {
  findMenuByDate,
  findThisWeekMenus,
} from "../repositories/menuSchedules";
export const router = Router();

router.get("/today", async (_req: Request, res: Response) => {
  const today = getDateGMT7();
  console.log(today);
  res.json(await findMenuByDate(today));
});

router.get("/week", async (_req: Request, res: Response) => {
  const today = getDateGMT7();
  console.log(today);
  res.json(await findThisWeekMenus(today));
});
