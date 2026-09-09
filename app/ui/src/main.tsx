import { StrictMode, useCallback, useEffect, useRef, useState } from "react";
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
type Page = "planner" | "menus" | "ingredients";
type CollectionMenu = {
	id: number;
	name: string;
	recipe: { ingredientName: string; amount: string }[] | null;
};
type CollectionIngredient = { id: number; name: string };

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
const emptyIngredient = (): Ingredient => ({
	id: crypto.randomUUID(),
	name: "",
	amount: "",
	remark: "",
});

function App() {
	const [page, setPage] = useState<Page>("planner");

	if (page === "menus") {
		return <CollectionPage type="menus" onNavigate={setPage} />;
	}
	if (page === "ingredients") {
		return <CollectionPage type="ingredients" onNavigate={setPage} />;
	}
	return <PlannerPage page={page} onNavigate={setPage} />;
}

function PlannerPage({
	page,
	onNavigate,
}: {
	page: Page;
	onNavigate: (page: Page) => void;
}) {
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
			<Navigation page={page} onNavigate={onNavigate} />
			<header className="header">
				<div className="eyebrow">KITCHEN PLANNER</div>
				<h1>What’s cooking?</h1>
				<p>Plan the week!</p>
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

function Navigation({
	page,
	onNavigate,
}: {
	page: Page;
	onNavigate: (page: Page) => void;
}) {
	return (
		<nav className="navigation" aria-label="Main navigation">
			{(
				[
					["planner", "Planner"],
					["menus", "Menus"],
					["ingredients", "Ingredients"],
				] as const
			).map(([value, label]) => (
				<button
					type="button"
					className={page === value ? "nav-button active" : "nav-button"}
					key={value}
					onClick={() => onNavigate(value)}
				>
					{label}
				</button>
			))}
		</nav>
	);
}

function CollectionPage({
	type,
	onNavigate,
}: {
	type: "menus" | "ingredients";
	onNavigate: (page: Page) => void;
}) {
	const [items, setItems] = useState<(CollectionMenu | CollectionIngredient)[]>(
		[],
	);
	const [name, setName] = useState("");
	const [recipe, setRecipe] = useState<Ingredient[]>([emptyIngredient()]);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");

	const loadItems = useCallback(async () => {
		setLoading(true);
		try {
			const response = await fetch(`${API_BASE}/${type}`);
			if (!response.ok) throw new Error(`Could not load ${type}`);
			setItems(
				(await response.json()) as (CollectionMenu | CollectionIngredient)[],
			);
		} catch (loadError) {
			setMessage(
				loadError instanceof Error ? loadError.message : "Could not load items",
			);
		} finally {
			setLoading(false);
		}
	}, [type]);

	useEffect(() => {
		void loadItems();
	}, [loadItems]);

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		setSaving(true);
		setMessage("");
		try {
			const body =
				type === "menus"
					? {
							name: name.trim(),
							recipe: recipe
								.filter((item) => item.name.trim())
								.map(({ name: ingredientName, amount }) => ({
									name: ingredientName.trim(),
									amount,
								})),
						}
					: { name: name.trim() };
			const response = await fetch(
				editingId === null
					? `${API_BASE}/${type}`
					: `${API_BASE}/menus/${editingId}`,
				{
					method: editingId === null ? "POST" : "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				},
			);
			if (!response.ok) throw new Error(`Could not save ${type.slice(0, -1)}`);
			setName("");
			setRecipe([emptyIngredient()]);
			setEditingId(null);
			setMessage("Saved");
			void loadItems();
		} catch (saveError) {
			setMessage(
				saveError instanceof Error ? saveError.message : "Could not save",
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="shell">
			<Navigation page={type} onNavigate={onNavigate} />
			<header className="header">
				<div className="eyebrow">KITCHEN COLLECTION</div>
				<h1>{type === "menus" ? "Menus" : "Ingredients"}</h1>
				<p>Keep your reusable {type} ready for the weekly planner.</p>
			</header>
			<main className="collection-layout">
				<form className="collection-form" onSubmit={submit}>
					<h2>
						{editingId === null ? "Add" : "Edit"}{" "}
						{type === "menus" ? "a menu" : "an ingredient"}
					</h2>
					<label>
						Name
						<input
							value={name}
							onChange={(event) => setName(event.target.value)}
							required
						/>
					</label>
					{type === "menus" && (
						<div className="collection-recipe">
							<div className="section-label">Recipe</div>
							{recipe.map((item, index) => (
								<div className="collection-recipe-row" key={item.id}>
									<input
										value={item.name}
										onChange={(event) =>
											setRecipe((current) =>
												current.map((entry, entryIndex) =>
													entryIndex === index
														? { ...entry, name: event.target.value }
														: entry,
												),
											)
										}
										placeholder="Ingredient"
									/>
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
					)}
					<div className="form-actions">
						<span className="save-message">{message}</span>
						<button type="submit" className="save-button" disabled={saving}>
							{saving ? "Saving..." : editingId === null ? "Add" : "Update"}
						</button>
					</div>
				</form>
				<section className="collection-list">
					{loading ? (
						<div className="loading">Loading...</div>
					) : (
						items.map((item) => (
							<article
								className={
									type === "menus"
										? "collection-item clickable"
										: "collection-item"
								}
								key={item.id}
								onClick={() => {
									if (type !== "menus") return;
									const menu = item as CollectionMenu;
									setEditingId(menu.id);
									setName(menu.name);
									setRecipe(
										menu.recipe?.length
											? menu.recipe.map((ingredient) => ({
													id: crypto.randomUUID(),
													name: ingredient.ingredientName,
													amount: ingredient.amount,
													remark: "",
												}))
											: [emptyIngredient()],
									);
									setMessage("");
								}}
							>
								<strong>{item.name}</strong>
								{type === "menus" && (item as CollectionMenu).recipe?.length ? (
									<span>
										{(item as CollectionMenu).recipe?.length} ingredients
									</span>
								) : null}
							</article>
						))
					)}
				</section>
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
