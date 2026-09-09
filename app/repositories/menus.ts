import { eq, like } from "drizzle-orm";
import { db, schema } from "../db";

const menus = schema.menus;
const ingredients = schema.ingredients;

export const getAll = async () => {
	return db.select().from(menus);
};

export const findMenusByKeyword = async (keyword: string) => {
	return db
		.select()
		.from(menus)
		.where(like(menus.name, `%${keyword.toLowerCase()}%`))
		.limit(5);
};

export const addMenus = async (menu: {
	name: string;
	recipe: {
		name: string;
		amount: string;
	}[];
}) => {
	const recipe = menu.recipe.map(({ name, amount }) => ({
		ingredientName: name.trim().toLowerCase(),
		amount: amount.trim().toLowerCase(),
	}));

	return db.transaction((tx) => {
		const result = tx
			.insert(menus)
			.values({ name: menu.name, recipe })
			.onConflictDoNothing()
			.returning()
			.all();

		if (recipe.length) {
			tx.insert(ingredients)
				.values(recipe.map(({ ingredientName }) => ({ name: ingredientName })))
				.onConflictDoNothing()
				.run();
		}

		return result;
	});
};

export const updateMenu = async (
	id: number,
	menu: {
		name: string;
		recipe: {
			name: string;
			amount: string;
		}[];
	},
) => {
	return db
		.update(menus)
		.set({
			name: menu.name,
			recipe: menu.recipe.map(({ name, amount }) => ({
				ingredientName: name.toLowerCase(),
				amount: amount.toLowerCase(),
			})),
		})
		.where(eq(menus.id, id))
		.returning();
};

export const removeMenu = async (id: number) => {
	return db.delete(menus).where(eq(menus.id, id));
};
