import type { Page } from "../types";

type NavigationProps = {
	page: Page;
	onNavigate: (page: Page) => void;
};

const navigationItems = [
	["planner", "Planner"],
	["menus", "Menus"],
	["ingredients", "Ingredients"],
] as const satisfies readonly [Page, string][];

export function Navigation({ page, onNavigate }: NavigationProps) {
	return (
		<nav className="navigation" aria-label="Main navigation">
			{navigationItems.map(([value, label]) => (
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
