type PageHeaderProps = {
	eyebrow: string;
	title: string;
	description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
	return (
		<header className="header">
			<div className="eyebrow">{eyebrow}</div>
			<h1>{title}</h1>
			<p>{description}</p>
		</header>
	);
}
