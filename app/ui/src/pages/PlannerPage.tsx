import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../api";
import { DayRow } from "../components/DayRow";
import { Navigation } from "../components/Navigation";
import { PageHeader } from "../components/PageHeader";
import type { MenuDay, Page } from "../types";

type PlannerPageProps = {
	page: Page;
	onNavigate: (page: Page) => void;
};

type Week = "week" | "next-week";

export function PlannerPage({ page, onNavigate }: PlannerPageProps) {
	const [week, setWeek] = useState<Week>("week");
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
			<PageHeader
				eyebrow="KITCHEN PLANNER"
				title="What's cooking?"
				description="Plan the week!"
			/>
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
