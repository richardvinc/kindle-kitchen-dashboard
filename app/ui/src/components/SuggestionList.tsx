type SuggestionListProps = {
	values: string[];
	onSelect: (value: string) => void;
};

export function SuggestionList({ values, onSelect }: SuggestionListProps) {
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
