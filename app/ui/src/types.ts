export type Ingredient = {
	id: string;
	name: string;
	amount: string;
	remark: string;
};

export type MenuDay = {
	day: string;
	date: string;
	name: string | null;
	ingredients: {
		ingredientName: string;
		amount: string;
		remark?: string;
	}[];
};

export type MenuSuggestion = {
	name: string;
	recipe: { ingredientName: string; amount: string }[] | null;
};

export type Page = "planner" | "menus" | "ingredients";
export type CollectionType = "menus" | "ingredients";

export type CollectionMenu = {
	id: number;
	name: string;
	recipe: { ingredientName: string; amount: string }[] | null;
};

export type CollectionIngredient = { id: number; name: string };
export type CollectionItem = CollectionMenu | CollectionIngredient;

export const emptyIngredient = (): Ingredient => ({
	id: crypto.randomUUID(),
	name: "",
	amount: "",
	remark: "",
});
