import { moment } from "obsidian";
import ar from "../locale/ar.json";
import cz from "../locale/cz.json";
import da from "../locale/da.json";
import de from "../locale/de.json";
import en from "../locale/en.json";
import enGB from "../locale/en-gb.json";
import es from "../locale/es.json";
import fr from "../locale/fr.json";
import hi from "../locale/hi.json";
import id from "../locale/id.json";
import it from "../locale/it.json";
import ja from "../locale/ja.json";
import ko from "../locale/ko.json";
import nl from "../locale/nl.json";
import no from "../locale/no.json";
import pl from "../locale/pl.json";
import pt from "../locale/pt.json";
import ptBR from "../locale/pt-br.json";
import ro from "../locale/ro.json";
import ru from "../locale/ru.json";
import tr from "../locale/tr.json";
import zhCN from "../locale/zh-cn.json";
import zhTW from "../locale/zh-tw.json";

const localeMap = {
	ar,
	cs: cz,
	da,
	de,
	en,
	"en-gb": enGB,
	es,
	fr,
	hi,
	id,
	it,
	ja,
	ko,
	nl,
	nn: no,
	pl,
	pt,
	"pt-br": ptBR,
	ro,
	ru,
	tr,
	"zh-cn": zhCN,
	"zh-tw": zhTW,
};

const locale = localeMap[moment.locale() as keyof typeof localeMap];

export default function t(str: string): string {
	if (!locale) {
		console.error("Error: dictionary locale not found", moment.locale());
	}

	return (locale && locale[str as keyof typeof locale]) || en[str as keyof typeof en];
}
