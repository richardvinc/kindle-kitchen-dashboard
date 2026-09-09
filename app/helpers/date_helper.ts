/**
 *
 * @param offsetDays how many day to add to today's date
 * @returns YYYY-MM-DD date in GMT+7
 */
export const getDateGMT7 = (offsetDays = 0) => {
	const date = new Date();
	date.setDate(date.getDate() + offsetDays);

	// en-CA will give YYYY-MM-DD
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Jakarta",
	}).format(date);
};

export function getStartEndWeekDateByDate(date: string) {
	const [year, month, day] = date.split("-").map(Number);

	// Create a UTC date representing the GMT+7 calendar date.
	const current = new Date(Date.UTC(year!, month! - 1, day));

	const dayOfWeek = current.getUTCDay(); // Sun = 0, Mon = 1, ..., Sat = 6
	const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

	const start = new Date(current);
	start.setUTCDate(start.getUTCDate() + daysToMonday);

	const end = new Date(start);
	end.setUTCDate(end.getUTCDate() + 6);

	const formatDate = (date: Date) =>
		[
			date.getUTCFullYear(),
			String(date.getUTCMonth() + 1).padStart(2, "0"),
			String(date.getUTCDate()).padStart(2, "0"),
		].join("-");

	return {
		start: formatDate(start),
		end: formatDate(end),
	};
}

export const addDays = (dateString: string, days: number) => {
	const date = new Date(`${dateString}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
};
