import { between, eq } from "drizzle-orm";
import { db, schema } from "../db";
import { getStartEndWeekDateByDate } from "../helpers";

const menuSchedules = schema.menuSchedules;

export const findMenuByDate = async (date: string) =>
  await db.select().from(menuSchedules).where(eq(menuSchedules.date, date));

export const findThisWeekMenus = async (todayDate: string) => {
  const thisWeekDate = getStartEndWeekDateByDate(todayDate);
  return await db
    .select()
    .from(menuSchedules)
    .where(between(menuSchedules.date, thisWeekDate.start, thisWeekDate.end));
};
