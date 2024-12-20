import fetch from "node-fetch";

// eslint-disable-next-line no-async-promise-executor
let version = await new Promise(async (resolve) => {
	console.log("The latest 5 Versions are:");
	console.log(
		(
			await (
				await fetch(
					"https://api.github.com/repos/lucide-icons/lucide/tags"
				)
			).json()
		)
			.slice(0, 4)
			.map((pre) => pre.name)
			.join("\n") + "\n"
	);
	console.log("Select Lucide Version: ");

	process.stdin.on("data", resolve);
});

const files = await (
	await fetch(
		`https://api.github.com/repos/lucide-icons/lucide/git/trees/${version}?recursive=1`
	)
).json();
const obsidianIconList = [
	"any-key",
	"audio-file",
	"blocks",
	"bold-glyph",
	"bracket-glyph",
	"broken-link",
	"bullet-list",
	"bullet-list-glyph",
	"calendar-with-checkmark",
	"check-in-circle",
	"check-small",
	"checkbox-glyph",
	"checkmark",
	"clock",
	"cloud",
	"code-glyph",
	"create-new",
	"cross",
	"cross-in-box",
	"crossed-star",
	"csv",
	"deleteColumn",
	"deleteRow",
	"dice",
	"document",
	"documents",
	"dot-network",
	"double-down-arrow-glyph",
	"double-up-arrow-glyph",
	"down-arrow-with-tail",
	"down-chevron-glyph",
	"enter",
	"exit-fullscreen",
	"expand-vertically",
	"filled-pin",
	"folder",
	"formula",
	"forward-arrow",
	"fullscreen",
	"gear",
	"go-to-file",
	"hashtag",
	"heading-glyph",
	"help",
	"highlight-glyph",
	"horizontal-split",
	"image-file",
	"image-glyph",
	"indent-glyph",
	"info",
	"insertColumn",
	"insertRow",
	"install",
	"italic-glyph",
	"keyboard-glyph",
	"languages",
	"left-arrow",
	"left-arrow-with-tail",
	"left-chevron-glyph",
	"lines-of-text",
	"link",
	"link-glyph",
	"logo-crystal",
	"magnifying-glass",
	"microphone",
	"microphone-filled",
	"minus-with-circle",
	"moveColumnLeft",
	"moveColumnRight",
	"moveRowDown",
	"moveRowUp",
	"note-glyph",
	"number-list-glyph",
	"open-vault",
	"pane-layout",
	"paper-plane",
	"paused",
	"pdf-file",
	"pencil",
	"percent-sign-glyph",
	"pin",
	"plus-with-circle",
	"popup-open",
	"presentation",
	"price-tag-glyph",
	"quote-glyph",
	"redo-glyph",
	"reset",
	"right-arrow",
	"right-arrow-with-tail",
	"right-chevron-glyph",
	"right-triangle",
	"run-command",
	"search",
	"sheets-in-box",
	"sortAsc",
	"sortDesc",
	"spreadsheet",
	"stacked-levels",
	"star",
	"star-list",
	"strikethrough-glyph",
	"switch",
	"sync",
	"sync-small",
	"tag-glyph",
	"three-horizontal-bars",
	"trash",
	"undo-glyph",
	"unindent-glyph",
	"up-and-down-arrows",
	"up-arrow-with-tail",
	"up-chevron-glyph",
	"uppercase-lowercase-a",
	"vault",
	"vertical-split",
	"vertical-three-dots",
	"wrench-screwdriver-glyph",
];
const iconList = [];

for (const item of files.tree) {
	const icon = item.path.match(/icons\/(.*)\.svg/)?.[1];
	if (icon) iconList.push(icon);
}

const newList = iconList.reduce((acc, lucide) => {
	if (obsidianIconList.findIndex((obsidian) => obsidian === lucide) === -1) {
		acc.push(lucide);
	} else {
		acc.push("lucide-" + lucide);
	}
	return acc;
}, []);

const dedupedList = [...new Set(newList)];

console.log(JSON.stringify(dedupedList));

process.exit();
