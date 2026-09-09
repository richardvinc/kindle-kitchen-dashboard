import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../api";
import { Navigation } from "../components/Navigation";
import { PageHeader } from "../components/PageHeader";
import {
	type CollectionItem,
	type CollectionMenu,
	type CollectionType,
	emptyIngredient,
	type Ingredient,
	type Page,
} from "../types";

type CollectionPageProps = {
	type: CollectionType;
	onNavigate: (page: Page) => void;
};

export function CollectionPage({ type, onNavigate }: CollectionPageProps) {
	const [items, setItems] = useState<CollectionItem[]>([]);
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
			setItems((await response.json()) as CollectionItem[]);
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

	const selectMenu = (item: CollectionItem) => {
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
	};

	return (
		<div className="shell">
			<Navigation page={type} onNavigate={onNavigate} />
			<PageHeader
				eyebrow="KITCHEN COLLECTION"
				title={type === "menus" ? "Menus" : "Ingredients"}
				description={`Keep your reusable ${type} ready for the weekly planner.`}
			/>
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
							// biome-ignore lint/a11y/useKeyWithClickEvents: menu rows are clickable by design
							<article
								className={
									type === "menus"
										? "collection-item clickable"
										: "collection-item"
								}
								key={item.id}
								onClick={() => selectMenu(item)}
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
