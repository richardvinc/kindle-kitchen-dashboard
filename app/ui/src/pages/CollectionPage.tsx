import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../api";
import { IngredientCollectionForm } from "../components/IngredientCollectionForm";
import { MenuCollectionForm } from "../components/MenuCollectionForm";
import { Navigation } from "../components/Navigation";
import { PageHeader } from "../components/PageHeader";
import type {
	CollectionItem,
	CollectionMenu,
	CollectionType,
	Page,
} from "../types";

type CollectionPageProps = {
	type: CollectionType;
	onNavigate: (page: Page) => void;
};

export function CollectionPage({ type, onNavigate }: CollectionPageProps) {
	const [items, setItems] = useState<CollectionItem[]>([]);
	const [selectedMenu, setSelectedMenu] = useState<CollectionMenu | null>(null);
	const [loading, setLoading] = useState(true);

	const loadItems = useCallback(async () => {
		setLoading(true);
		try {
			const response = await fetch(`${API_BASE}/${type}`);
			if (!response.ok) throw new Error(`Could not load ${type}`);
			setItems((await response.json()) as CollectionItem[]);
		} finally {
			setLoading(false);
		}
	}, [type]);

	useEffect(() => {
		setSelectedMenu(null);
		void loadItems();
	}, [loadItems]);

	const deleteItem = async (item: CollectionItem) => {
		if (!window.confirm(`Delete ${item.name}?`)) return;

		const response = await fetch(`${API_BASE}/${type}/${item.id}`, {
			method: "DELETE",
		});
		if (!response.ok) return;
		if (selectedMenu?.id === item.id) setSelectedMenu(null);
		void loadItems();
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
				{type === "menus" ? (
					<MenuCollectionForm
						menu={selectedMenu}
						onSaved={() => {
							setSelectedMenu(null);
							void loadItems();
						}}
					/>
				) : (
					<IngredientCollectionForm onSaved={() => void loadItems()} />
				)}
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
								onClick={() => {
									if (type === "menus") setSelectedMenu(item as CollectionMenu);
								}}
							>
								<div>
									<strong>{item.name}</strong>
									{type === "menus" &&
									(item as CollectionMenu).recipe?.length ? (
										<span>
											{(item as CollectionMenu).recipe?.length} ingredients
										</span>
									) : null}
								</div>
								<button
									type="button"
									className="delete-button"
									onClick={(event) => {
										event.stopPropagation();
										void deleteItem(item);
									}}
								>
									Delete
								</button>
							</article>
						))
					)}
				</section>
			</main>
		</div>
	);
}
