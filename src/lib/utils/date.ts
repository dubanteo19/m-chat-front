export const formatDate = (dateInput: string) => {
	const date = new Date(dateInput);
	const timeString = date.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	});
	const today = new Date();
	const isToday =
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear();

	if (isToday) {
		return timeString; // "10:45 AM"
	}
	const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const diffInMs = startOfTarget.getTime() - startOfToday.getTime();
	const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24)); // Will be -1 for yesterday, -2, etc.
	const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });
	const relativeDayString = rtf.format(diffInDays, 'day'); // Returns "yesterday", "2 days ago", etc.
	const capitalizedDay = relativeDayString.charAt(0).toUpperCase() + relativeDayString.slice(1);
	return `${capitalizedDay} ${timeString}`; // "Yesterday 10:45 AM" or "2 days ago 10:45 AM"
};

