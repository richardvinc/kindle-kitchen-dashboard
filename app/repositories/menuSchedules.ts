import { and, eq, gte, lte } from "drizzle-orm";
import { db, schema } from "../db";
import { addDays, getStartEndWeekDateByDate } from "../helpers";

const menuSchedules = schema.menuSchedules;

export const getDetailedMenuByDate = async (date: string) => {
	const schedule = await db
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
			ingredients: [],
		};
	}

	return {
		name: schedule.name,
		ingredients: schedule.ingredients?.map(
			({ ingredientName, amount, remark }) =>
				`${ingredientName}: ${amount}${remark ? ` (${remark})` : ""}`,
		),
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

		return `${dayNames[index]}: ${schedule?.name ?? null}`;
	});
};

export const findNextWeekMenus = async (todayDate: string) => {
	const { start } = getStartEndWeekDateByDate(todayDate);

	const nextWeekStart = addDays(start, 7);
	const nextWeekEnd = addDays(start, 13);

	const schedules = await db
		.select({
			name: menuSchedules.name,
			date: menuSchedules.date,
		})
		.from(menuSchedules)
		.where(
			and(
				gte(menuSchedules.date, nextWeekStart),
				lte(menuSchedules.date, nextWeekEnd),
			),
		);

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
		const dateString = addDays(nextWeekStart, index);
		const schedule = schedules.find((schedule) => schedule.date === dateString);

		return `${dayNames[index]}: ${schedule?.name ?? null}`;
	});
};

export const addMenuToDate = async (menu: {
	date: string;
	name: string;
	ingredients: { name: string; amount: string; remark?: string }[];
}) => {
	await db
		.insert(menuSchedules)
		.values({
			name: menu.name,
			date: menu.date,
			ingredients: menu.ingredients.map(({ name, amount, remark }) => ({
				ingredientName: name,
				amount,
				remark,
			})),
		})
		.onConflictDoUpdate({
			target: menuSchedules.date,
			set: {
				name: menu.name,
				ingredients: menu.ingredients.map(({ name, amount, remark }) => ({
					ingredientName: name,
					amount,
					remark,
				})),
			},
		})
		.returning();
};
