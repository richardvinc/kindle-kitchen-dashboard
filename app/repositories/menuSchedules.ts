import { and, eq, gte, lte } from "drizzle-orm";
import { db, schema } from "../db";
import { getStartEndWeekDateByDate } from "../helpers";

const menuSchedules = schema.menuSchedules;

export const findMenuByDate = async (date: string) => {
  const schedule = db
    .select({
      name: menuSchedules.name,
      ingredients: menuSchedules.ingredients,
    })
    .from(menuSchedules)
    .where(eq(menuSchedules.date, date))
    .get();

  if (!schedule) {
    return {
      name: "OFF",
      ingredients: "",
    };
  }

  return {
    name: schedule.name,
    ingredients: schedule.ingredients
      .map(
        ({ ingredientName, amount, remark }) =>
          `${ingredientName}: ${amount}${remark ? ` (${remark})` : ""}`,
      )
      .join("\n"),
  };
};

export const findThisWeekMenus = async (todayDate: string) => {
  const { start, end } = getStartEndWeekDateByDate(todayDate);

  const schedules = await db
    .select({
      name: menuSchedules.name,
      date: menuSchedules.date,
    })
    .from(menuSchedules)
    .where(and(gte(menuSchedules.date, start), lte(menuSchedules.date, end)));

  const dayNames = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
  ];

  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(`${start}T00:00:00Z`);
    currentDate.setUTCDate(currentDate.getUTCDate() + index);

    const dateString = currentDate.toISOString().slice(0, 10);

    const schedule = schedules.find((schedule) => schedule.date === dateString);

    return `${dayNames[index]}: ${schedule?.name ?? "OFF"}`;
  });
};
