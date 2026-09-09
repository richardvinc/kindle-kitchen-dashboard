import { useState } from "react";
import { API_BASE } from "../api";

type IngredientCollectionFormProps = {
	onSaved: () => void;
};

export function IngredientCollectionForm({
	onSaved,
}: IngredientCollectionFormProps) {
	const [name, setName] = useState("");
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		setSaving(true);
		setMessage("");
		try {
			const response = await fetch(`${API_BASE}/ingredients`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: name.trim() }),
			});
			if (!response.ok) throw new Error("Could not save ingredient");
			setName("");
			setMessage("Saved");
			onSaved();
		} catch (saveError) {
			setMessage(
				saveError instanceof Error
					? saveError.message
					: "Could not save ingredient",
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<form className="collection-form" onSubmit={submit}>
			<h2>Add an ingredient</h2>
			<label>
				Name
				<input
					value={name}
					onChange={(event) => setName(event.target.value)}
					required
				/>
			</label>
			<div className="form-actions">
				<span className="save-message">{message}</span>
				<button type="submit" className="save-button" disabled={saving}>
					{saving ? "Saving..." : "Add"}
				</button>
			</div>
		</form>
	);
}
