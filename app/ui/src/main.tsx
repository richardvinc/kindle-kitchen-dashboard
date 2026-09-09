import { StrictMode, useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

type Ingredient = { id: string; name: string; amount: string; remark: string };
type MenuDay = {
	day: string;
	date: string;
	name: string | null;
	ingredients: { ingredientName: string; amount: string; remark?: string }[];
};
type MenuSuggestion = {
	name: string;
	recipe: { ingredientName: string; amount: string }[] | null;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
const emptyIngredient = (): Ingredient => ({
	id: crypto.randomUUID(),
	name: "",
	amount: "",
	remark: "",
});

function App() {
	const [week, setWeek] = useState<"week" | "next-week">("week");
	const [days, setDays] = useState<MenuDay[]>([]);
	const [editingDate, setEditingDate] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const loadWeek = useCallback(async () => {
		setLoading(true);
		try {
			const response = await fetch(`${API_BASE}/menuSchedules/${week}`);
			if (!response.ok) throw new Error("Could not load the menu");
			setDays((await response.json()) as MenuDay[]);
		} catch (loadError) {
			setError(
				loadError instanceof Error
					? loadError.message
					: "Could not load the menu",
			);
		} finally {
			setLoading(false);
		}
	}, [week]);

	useEffect(() => {
		void loadWeek();
	}, [loadWeek]);

	return (
		<div className="shell">
			<header className="header">
				<div className="eyebrow">KITCHEN PLANNER</div>
				<h1>What’s cooking?</h1>
				<p>Plan the week, one good meal at a time.</p>
			</header>
			<main>
				<div className="tabs" role="tablist" aria-label="Menu weeks">
					{(
						[
							["week", "This week"],
							["next-week", "Next week"],
						] as const
					).map(([value, label]) => (
						<button
							type="button"
							className={week === value ? "tab active" : "tab"}
							key={value}
							onClick={() => {
								setWeek(value);
								setEditingDate(null);
							}}
							role="tab"
							aria-selected={week === value}
						>
							{label}
						</button>
					))}
				</div>
				{error && <div className="notice error">{error}</div>}
				{loading ? (
					<div className="loading">Loading your menu...</div>
				) : (
					<section className="week-list">
						{days.map((day) => (
							<DayRow
								key={day.date}
								day={day}
								editing={editingDate === day.date}
								onEdit={() =>
									setEditingDate(editingDate === day.date ? null : day.date)
								}
								onSaved={() => void loadWeek()}
							/>
						))}
					</section>
				)}
			</main>
		</div>
	);
}

function DayRow({
	day,
	editing,
	onEdit,
	onSaved,
}: {
	day: MenuDay;
	editing: boolean;
	onEdit: () => void;
	onSaved: () => void;
}) {
	return (
		<article className={editing ? "day-card editing" : "day-card"}>
			<div className="day-summary">
				<div className="date-block">
					<strong>{day.day}</strong>
					<span>{day.date}</span>
				</div>
				<div className={day.name ? "menu-name" : "menu-name muted"}>
					{day.name ?? "No menu planned"}
				</div>
				<button type="button" className="edit-button" onClick={onEdit}>
					{editing ? "Close" : "Edit"}
				</button>
			</div>
			{editing && <MenuForm day={day} onSaved={onSaved} />}
		</article>
	);
}

function MenuForm({ day, onSaved }: { day: MenuDay; onSaved: () => void }) {
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
						void find(event.target.value, "menu");
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
						if (selected?.recipe?.length) {
							setIngredients(
								selected.recipe.map((ingredient) => ({
									id: crypto.randomUUID(),
									name: ingredient.ingredientName,
									amount: ingredient.amount,
									remark: "",
								})),
							);
						}
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
									void find(event.target.value, "ingredient", index);
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

function SuggestionList({
	values,
	onSelect,
}: {
	values: string[];
	onSelect: (value: string) => void;
}) {
	return (
		<div className="suggestions">
			{values.map((value) => (
				<button
					type="button"
					key={value}
					onMouseDown={(event) => event.preventDefault()}
					onClick={() => onSelect(value)}
				>
					{value}
				</button>
			))}
		</div>
	);
}

const appElement = document.querySelector<HTMLDivElement>("#app");
if (!appElement) throw new Error("App root not found");
createRoot(appElement).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
