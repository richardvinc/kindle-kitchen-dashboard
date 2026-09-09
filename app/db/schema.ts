import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const ingredients = sqliteTable("ingredients", {
	id: integer("id").primaryKey(),
	name: text("name").unique().notNull(),
});

export const menus = sqliteTable("menus", {
	id: integer("id").primaryKey(),
	name: text("name").notNull().unique(),
	recipe: text("recipe", { mode: "json" }).$type<
		{
			ingredientName: string;
			amount: string;
		}[]
	>(),
});

export const menuSchedules = sqliteTable("menu_schedules", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	date: text("date").notNull().unique(),
	ingredients: text("ingredients", { mode: "json" }).$type<
		{
			ingredientName: string;
			amount: string;
			remark?: string;
		}[]
	>(),
});
