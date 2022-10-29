import { Modal, TextAreaComponent } from "obsidian";
import CommanderPlugin from "src/main";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import {
	bracketMatching,
	defaultHighlightStyle,
	foldGutter,
	foldKeymap,
	indentOnInput,
	syntaxHighlighting,
} from "@codemirror/language";
import { EditorState, Extension } from "@codemirror/state";
import {
	drawSelection,
	dropCursor,
	EditorView,
	highlightSpecialChars,
	keymap,
	lineNumbers,
	rectangularSelection,
} from "@codemirror/view";
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";

export const basicSetup: Extension[] = [
	lineNumbers(),
	// highlightActiveLineGutter(),
	highlightSpecialChars(),
	history(),
	javascript(),
	foldGutter(),
	drawSelection(),
	dropCursor(),
	EditorState.allowMultipleSelections.of(true),
	indentOnInput(),
	syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
	EditorView.lineWrapping,
	bracketMatching(),
	closeBrackets(),
	autocompletion(),
	rectangularSelection(),
	highlightSelectionMatches(),
	keymap.of([
		...closeBracketsKeymap,
		...defaultKeymap,
		...searchKeymap,
		...historyKeymap,
		indentWithTab,
		...foldKeymap,
		...completionKeymap,
	]),
].filter(ext => ext);

function editorFromTextArea(textarea: HTMLTextAreaElement, extensions: Extension) {
	let view = new EditorView({
		state: EditorState.create({ doc: textarea.value, extensions }),
	});
	textarea.parentNode!.insertBefore(view.dom, textarea);
	textarea.style.display = "none";
	if (textarea.form)
		textarea.form.addEventListener("submit", () => {
			textarea.value = view.state.doc.toString();
		});
	return view;
}

export default class CustomJSModal extends Modal {
	private plugin: CommanderPlugin;
	editor: EditorView;

	public constructor(
		plugin: CommanderPlugin,
	) {
		super(app);
		this.plugin = plugin;
	}

	public onOpen(): void {
		this.titleEl.setText("Macro Builder");
		const customCSSEl = new TextAreaComponent(this.contentEl);
		this.editor = editorFromTextArea(customCSSEl.inputEl, basicSetup);
	}

	public onClose(): void {
		this.containerEl.empty();
		this.editor?.destroy();
	}
}
