import dayjs from "dayjs";
import "dayjs/locale/es";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale("es", {
	relativeTime: {
		future: "en %s",
		past: "Hace %s",
		s: "unos segundos",
		m: "un minuto",
		mm: "%d minutos",
		h: "una hora",
		hh: "%d horas",
		d: "un día",
		dd: "%d días",
		M: "un mes",
		MM: "%d meses",
		y: "un año",
		yy: "%d años",
	},
});

export const tempo = (time: string) => {
	return dayjs(time).fromNow();
};

export const pluralize = (
	count: number,
	noun: string,
	showCount: boolean = true,
	suffix: string = "s"
) => `${showCount ? count : ""} ${noun}${count !== 1 ? suffix : ""}`;

export const string_trunc = (
	content: string,
	length: number = 150,
	suffix: string = "..."
) => {
	if (content.length > length) {
		var trimmedString = content.substr(0, length);
		content =
			trimmedString.substr(
				0,
				Math.min(trimmedString.length, trimmedString.lastIndexOf(" "))
			) + suffix;
	}
	return content;
};

export const linebreaks = (content: string) => {
	if (content.length > length) {
		let html = "";
		content.split("\n").map((i, key) => {
			html += i + "<br/>";
		});
		return html;
	}
	return content;
};

export const status_text = (status: string) => {
	switch (status) {
		case "pending":
			return "Pendiente";
		case "accepted":
			return "Aceptada";
		case "rejected":
			return "Rechazada";
		default:
			return status;
	}
};
