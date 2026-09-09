import { like } from "drizzle-orm";
import { db, schema } from "../db";

const menus = schema.menus;

export const getAll = async () => {
	return db.select().from(menus);
};

export const findMenusByKeyword = async (keyword: string) => {
	return db
		.select()
		.from(menus)
		.where(like(menus.name, `%${keyword}%`))
		.limit(5);
};

export const addMenus = async (menu: {
	name: string;
	recipe: {
		name: string;
		amount: string;
	}[];
}) => {
	return await db
		.insert(menus)
		.values({
			name: menu.name,
			recipe: menu.recipe.map(({ name, amount }) => ({
				ingredientName: name,
				amount,
			})),
		})
		.onConflictDoNothing()
		.returning();
};
