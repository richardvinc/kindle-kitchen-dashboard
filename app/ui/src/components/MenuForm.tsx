import { useRef, useState } from "react";
import { API_BASE } from "../api";
import {
	emptyIngredient,
	type Ingredient,
	type MenuDay,
	type MenuSuggestion,
} from "../types";
import { SuggestionList } from "./SuggestionList";

type MenuFormProps = {
	day: MenuDay;
	onSaved: () => void;
};

export function MenuForm({ day, onSaved }: MenuFormProps) {
	const [name, setName] = useState(day.name ?? "");
	const [ingredients, setIngredients] = useState<Ingredient[]>(
		day.ingredients.length
			? day.ingredients.map((item) => ({
					id: crypto.randomUUID(),
					name: item.ingredientName,
					amount: item.amount,
					remark: item.remark ?? "",
				}))
			: [emptyIngredient()],
	);
	const [saveToCollection, setSaveToCollection] = useState(false);
	const [suggestions, setSuggestions] = useState<MenuSuggestion[]>([]);
	const [ingredientSuggestions, setIngredientSuggestions] = useState<
		Record<number, string[]>
	>({});
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");
	const isOff = name.trim().toUpperCase() === "OFF";
	const searchTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
		{},
	);

	const find = async (
		value: string,
		type: "menu" | "ingredient",
		index?: number,
	) => {
		if (value.trim().length < 2) {
			if (type === "menu") setSuggestions([]);
			else
				setIngredientSuggestions((current) => ({
					...current,
					[index ?? 0]: [],
				}));
			return;
		}
		const endpoint = type === "menu" ? "menus" : "ingredients";
		const response = await fetch(
			`${API_BASE}/${endpoint}/find?keyword=${encodeURIComponent(value)}`,
		);
		const matches = (await response.json()) as (
			| MenuSuggestion
			| { name: string }
		)[];
		if (type === "menu") setSuggestions(matches as MenuSuggestion[]);
		else
			setIngredientSuggestions((current) => ({
				...current,
				[index ?? 0]: matches.map((match) => match.name),
			}));
	};

	const scheduleFind = (
		value: string,
		type: "menu" | "ingredient",
		index?: number,
	) => {
		const key = `${type}-${index ?? "menu"}`;
		const existingTimer = searchTimers.current[key];
		if (existingTimer) clearTimeout(existingTimer);
		if (value.trim().length < 2) {
			void find(value, type, index);
			return;
		}
		searchTimers.current[key] = setTimeout(() => {
			void find(value, type, index);
			delete searchTimers.current[key];
		}, 300);
	};

	const updateIngredient = (
		index: number,
		field: keyof Ingredient,
		value: string,
	) =>
		setIngredients((current) =>
			current.map((item, itemIndex) =>
				itemIndex === index ? { ...item, [field]: value } : item,
			),
		);

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		setSaving(true);
		setMessage("");
		try {
			const validIngredients = isOff
				? []
				: ingredients.filter((ingredient) => ingredient.name.trim());
			const schedule = await fetch(`${API_BASE}/menuSchedules`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					date: day.date,
					name: name.trim(),
					ingredients: validIngredients,
				}),
			});
			if (!schedule.ok) throw new Error("Could not save the schedule");
			if (saveToCollection) {
				await Promise.all([
					fetch(`${API_BASE}/menus`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							name: name.trim(),
							recipe: validIngredients.map(
								({ name: ingredientName, amount }) => ({
									name: ingredientName,
									amount,
								}),
							),
						}),
					}),
					...validIngredients.map((ingredient) =>
						fetch(`${API_BASE}/ingredients`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ name: ingredient.name.trim() }),
						}),
					),
				]);
			}
			setMessage("Saved");
			onSaved();
		} catch (saveError) {
			setMessage(
				saveError instanceof Error ? saveError.message : "Could not save",
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<form className="menu-form" onSubmit={submit}>
			<div className="form-heading">
				<div>
					<span className="eyebrow">EDITING {day.day.toUpperCase()}</span>
					<h2>{day.name ? "Tune this menu" : "Add a menu"}</h2>
				</div>
				<input
					className="form-date"
					type="date"
					value={day.date}
					disabled
					aria-label="Menu date"
				/>
			</div>
			<label>
				Menu name
				<input
					value={name}
					onBlur={() => setSuggestions([])}
					onChange={(event) => {
						setName(event.target.value);
						scheduleFind(event.target.value, "menu");
					}}
					placeholder="e.g. Lemon chicken"
					required
				/>
			</label>
			{suggestions.length > 0 && (
				<SuggestionList
					values={suggestions.map((suggestion) => suggestion.name)}
					onSelect={(value) => {
						const selected = suggestions.find(
							(suggestion) => suggestion.name === value,
						);
						setName(value);
						if (selected?.recipe?.length)
							setIngredients(
								selected.recipe.map((ingredient) => ({
									id: crypto.randomUUID(),
									name: ingredient.ingredientName,
									amount: ingredient.amount,
									remark: "",
								})),
							);
						setSuggestions([]);
					}}
				/>
			)}
			<div className={isOff ? "ingredients disabled" : "ingredients"}>
				<div className="section-label">
					Ingredients {isOff && <span>OFF has no ingredients</span>}
				</div>
				{ingredients.map((ingredient, index) => (
					<div className="ingredient-row" key={ingredient.id}>
						<div className="ingredient-input">
							<input
								value={ingredient.name}
								disabled={isOff}
								onBlur={() =>
									setIngredientSuggestions((current) => ({
										...current,
										[index]: [],
									}))
								}
								onChange={(event) => {
									updateIngredient(index, "name", event.target.value);
									scheduleFind(event.target.value, "ingredient", index);
								}}
								placeholder="Ingredient"
							/>
							{ingredientSuggestions[index]?.length > 0 && (
								<SuggestionList
									values={ingredientSuggestions[index]}
									onSelect={(value) => {
										updateIngredient(index, "name", value);
										setIngredientSuggestions((current) => ({
											...current,
											[index]: [],
										}));
									}}
								/>
							)}
						</div>
						<input
							value={ingredient.amount}
							disabled={isOff}
							onChange={(event) =>
								updateIngredient(index, "amount", event.target.value)
							}
							placeholder="Amount"
						/>
						<input
							value={ingredient.remark}
							disabled={isOff}
							onChange={(event) =>
								updateIngredient(index, "remark", event.target.value)
							}
							placeholder="Remark"
						/>
						<button
							type="button"
							className="remove-ingredient"
							disabled={isOff}
							aria-label={`Remove ${ingredient.name || "ingredient"}`}
							onClick={() =>
								setIngredients((current) =>
									current.filter((_, itemIndex) => itemIndex !== index),
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
					disabled={isOff}
					onClick={() =>
						setIngredients((current) => [...current, emptyIngredient()])
					}
				>
					<span>+</span> Add ingredient
				</button>
			</div>
			<label className="check-row">
				<input
					type="checkbox"
					checked={saveToCollection}
					onChange={(event) => setSaveToCollection(event.target.checked)}
				/>{" "}
				<span>Insert/update to menu collection</span>
			</label>
			<div className="form-actions">
				<span className="save-message">{message}</span>
				<button type="submit" className="save-button" disabled={saving}>
					{saving ? "Saving..." : day.name ? "Update menu" : "Insert menu"}
				</button>
			</div>
		</form>
	);
}
