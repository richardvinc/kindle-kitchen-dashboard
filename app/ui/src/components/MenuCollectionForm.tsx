import { useEffect, useRef, useState } from "react";
import { API_BASE } from "../api";
import {
	type CollectionMenu,
	createClientId,
	emptyIngredient,
	type Ingredient,
} from "../types";
import { SuggestionList } from "./SuggestionList";

type MenuCollectionFormProps = {
	menu: CollectionMenu | null;
	onSaved: () => void;
};

export function MenuCollectionForm({ menu, onSaved }: MenuCollectionFormProps) {
	const [name, setName] = useState(menu?.name ?? "");
	const [recipe, setRecipe] = useState<Ingredient[]>(() =>
		menu?.recipe?.length
			? menu.recipe.map((ingredient) => ({
					id: createClientId(),
					name: ingredient.ingredientName,
					amount: ingredient.amount,
					remark: "",
				}))
			: [emptyIngredient()],
	);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");
	const [ingredientSuggestions, setIngredientSuggestions] = useState<
		Record<number, string[]>
	>({});
	const searchTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>(
		{},
	);

	useEffect(() => {
		setName(menu?.name ?? "");
		setRecipe(
			menu?.recipe?.length
				? menu.recipe.map((ingredient) => ({
						id: createClientId(),
						name: ingredient.ingredientName,
						amount: ingredient.amount,
						remark: "",
					}))
				: [emptyIngredient()],
		);
		setIngredientSuggestions({});
		setMessage("");
	}, [menu]);

	const findIngredients = (value: string, index: number) => {
		const existingTimer = searchTimers.current[index];
		if (existingTimer) clearTimeout(existingTimer);
		if (value.trim().length < 2) {
			setIngredientSuggestions((current) => ({ ...current, [index]: [] }));
			return;
		}
		searchTimers.current[index] = setTimeout(() => {
			void (async () => {
				const response = await fetch(
					`${API_BASE}/ingredients/find?keyword=${encodeURIComponent(value)}`,
				);
				if (!response.ok) return;
				const matches = (await response.json()) as { name: string }[];
				setIngredientSuggestions((current) => ({
					...current,
					[index]: matches.map((match) => match.name),
				}));
			})();
			delete searchTimers.current[index];
		}, 300);
	};

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		setSaving(true);
		setMessage("");
		try {
			const response = await fetch(
				menu ? `${API_BASE}/menus/${menu.id}` : `${API_BASE}/menus`,
				{
					method: menu ? "PUT" : "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: name.trim(),
						recipe: recipe
							.filter((item) => item.name.trim())
							.map(({ name: ingredientName, amount }) => ({
								name: ingredientName.trim(),
								amount,
							})),
					}),
				},
			);
			if (!response.ok) throw new Error("Could not save menu");
			setMessage("Saved");
			onSaved();
		} catch (saveError) {
			setMessage(
				saveError instanceof Error ? saveError.message : "Could not save menu",
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<form className="collection-form" onSubmit={submit}>
			<h2>{menu ? "Edit a menu" : "Add a menu"}</h2>
			<label>
				Name
				<input
					value={name}
					onChange={(event) => setName(event.target.value)}
					required
				/>
			</label>
			<div className="collection-recipe">
				<div className="section-label">Recipe</div>
				{recipe.map((item, index) => (
					<div className="collection-recipe-row" key={item.id}>
						<div className="ingredient-input">
							<input
								value={item.name}
								onBlur={() =>
									setIngredientSuggestions((current) => ({
										...current,
										[index]: [],
									}))
								}
								onChange={(event) => {
									const value = event.target.value;
									setRecipe((current) =>
										current.map((entry, entryIndex) =>
											entryIndex === index ? { ...entry, name: value } : entry,
										),
									);
									findIngredients(value, index);
								}}
								placeholder="Ingredient"
							/>
							{ingredientSuggestions[index]?.length > 0 && (
								<SuggestionList
									values={ingredientSuggestions[index]}
									onSelect={(value) => {
										setRecipe((current) =>
											current.map((entry, entryIndex) =>
												entryIndex === index
													? { ...entry, name: value }
													: entry,
											),
										);
										setIngredientSuggestions((current) => ({
											...current,
											[index]: [],
										}));
									}}
								/>
							)}
						</div>
						<input
							value={item.amount}
							onChange={(event) =>
								setRecipe((current) =>
									current.map((entry, entryIndex) =>
										entryIndex === index
											? { ...entry, amount: event.target.value }
											: entry,
									),
								)
							}
							placeholder="Amount"
						/>
						<button
							type="button"
							className="remove-ingredient"
							onClick={() =>
								setRecipe((current) =>
									current.filter((_, entryIndex) => entryIndex !== index),
								)
							}
						>
							Remove
						</button>
					</div>
				))}
				<button
					type="button"
					className="add-ingredient"
					onClick={() =>
						setRecipe((current) => [...current, emptyIngredient()])
					}
				>
					+ Add ingredient
				</button>
			</div>
			<div className="form-actions">
				<span className="save-message">{message}</span>
				<button
					type="button"
					className="delete-button"
					onClick={() => onSaved()}
				>
					Cancel
				</button>
				<button type="submit" className="save-button" disabled={saving}>
					{saving ? "Saving..." : menu ? "Update" : "Add"}
				</button>
			</div>
		</form>
	);
}
