import type { MenuDay } from "../types";
import { MenuForm } from "./MenuForm";

type DayRowProps = {
	day: MenuDay;
	editing: boolean;
	onEdit: () => void;
	onSaved: () => void;
};

export function DayRow({ day, editing, onEdit, onSaved }: DayRowProps) {
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
