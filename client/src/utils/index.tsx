import dayjs from "dayjs";

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

export const pluralize = (count: number, noun: string, suffix: string = "s") =>
	`${count} ${noun}${count !== 1 ? suffix : ""}`;
