import { like } from "drizzle-orm";
import { db, schema } from "../db";

const ingredients = schema.ingredients;

export const getAll = async () => {
	return db.select().from(ingredients).all();
};

export const findIngredientsByKeyword = async (keyword: string) => {
	return db
		.select()
		.from(ingredients)
		.where(like(ingredients.name, `%${keyword}%`));
};

export const addIngredient = async (ingredient: { name: string }) => {
	return db
		.insert(ingredients)
		.values({
			name: ingredient.name,
		})
		.onConflictDoNothing()
		.returning();
};
