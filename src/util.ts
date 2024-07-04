export function getNow(format: string): string {
	const now = new Date();
	const year = now.getFullYear();
	const year2Digits = String(year).slice(-2); // 두 자리 연도
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");
	const seconds = String(now.getSeconds()).padStart(2, "0");
	const ampm = Number(hours) >= 12 ? "PM" : "AM";
	const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
		now.getDay()
	];

	// Replace format tokens with actual values
	const formattedDate = format
		.replace("YYYY", String(year))
		.replace("YY", year2Digits)
		.replace("MM", month)
		.replace("DD", day)
		.replace("hh", hours)
		.replace("mm", minutes)
		.replace("ss", seconds)
		.replace("a", ampm)
		.replace("ddd", dayOfWeek);

	return formattedDate;
}
