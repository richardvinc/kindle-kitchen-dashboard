import { useState } from "react";
import { CollectionPage } from "./pages/CollectionPage";
import { PlannerPage } from "./pages/PlannerPage";
import type { Page } from "./types";

export function App() {
	const [page, setPage] = useState<Page>("planner");

	if (page === "menus" || page === "ingredients") {
		return <CollectionPage type={page} onNavigate={setPage} />;
	}
	return <PlannerPage page={page} onNavigate={setPage} />;
}
