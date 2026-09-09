import { eq, like } from "drizzle-orm";
import { db, schema } from "../db";

const ingredients = schema.ingredients;

export const getAll = async () => {
	return db.select().from(ingredients).all();
};

export const findIngredientsByKeyword = async (keyword: string) => {
	return db
		.select()
		.from(ingredients)
		.where(like(ingredients.name, `%${keyword}%`))
		.limit(5);
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

export const removeIngredient = async (id: number) => {
	return db.delete(ingredients).where(eq(ingredients.id, id));
};
