import { App, Command, FuzzyMatch, FuzzySuggestModal, Modal, Notice, Plugin, PluginSettingTab, setIcon, Setting } from 'obsidian';
import { addFeatherIcons } from './ui/icons';
import CustomSidebarSettingsTab, { CustomSidebarSettings, DEFAULT_SETTINGS } from './ui/settingsTab';

export default class CustomSidebarPlugin extends Plugin {
	settings: CustomSidebarSettings;
	iconList: string[] = ["any-key", "audio-file", "blocks", "bold-glyph", "bracket-glyph", "broken-link", "bullet-list", "bullet-list-glyph", "calendar-with-checkmark", "check-in-circle", "check-small", "checkbox-glyph", "checkmark", "clock", "cloud", "code-glyph", "create-new", "cross", "cross-in-box", "crossed-star", "csv", "deleteColumn", "deleteRow", "dice", "document", "documents", "dot-network", "double-down-arrow-glyph", "double-up-arrow-glyph", "down-arrow-with-tail", "down-chevron-glyph", "enter", "exit-fullscreen", "expand-vertically", "filled-pin", "folder", "formula", "forward-arrow", "fullscreen", "gear", "go-to-file", "hashtag", "heading-glyph", "help", "highlight-glyph", "horizontal-split", "image-file", "image-glyph", "indent-glyph", "info", "insertColumn", "insertRow", "install", "italic-glyph", "keyboard-glyph", "languages", "left-arrow", "left-arrow-with-tail", "left-chevron-glyph", "lines-of-text", "link", "link-glyph", "logo-crystal", "magnifying-glass", "microphone", "microphone-filled", "minus-with-circle", "moveColumnLeft", "moveColumnRight", "moveRowDown", "moveRowUp", "note-glyph", "number-list-glyph", "open-vault", "pane-layout", "paper-plane", "paused", "pdf-file", "pencil", "percent-sign-glyph", "pin", "plus-with-circle", "popup-open", "presentation", "price-tag-glyph", "quote-glyph", "redo-glyph", "reset", "right-arrow", "right-arrow-with-tail", "right-chevron-glyph", "right-triangle", "run-command", "search", "sheets-in-box", "sortAsc", "sortDesc", "spreadsheet", "stacked-levels", "star", "star-list", "strikethrough-glyph", "switch", "sync", "sync-small", "tag-glyph", "three-horizontal-bars", "trash", "undo-glyph", "unindent-glyph", "up-and-down-arrows", "up-arrow-with-tail", "up-chevron-glyph", "uppercase-lowercase-a", "vault", "vertical-split", "vertical-three-dots", "wrench-screwdriver-glyph"];

	async onload() {
		console.log('loading plugin');

		await this.loadSettings();

		this.addSettingTab(new CustomSidebarSettingsTab(this.app, this));

		addFeatherIcons(this.iconList);

		this.settings.sidebarCommands.forEach(c => {
			this.addRibbonIcon(c.icon, c.name, () => {
				//@ts-ignore
				this.app.commands.executeCommandById(c.id);
			});
		});

		this.addExtraCommands();

		this.app.workspace.onLayoutReady(() => this.hideCommands());
	}

	onunload() {
		console.log('unloading plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	addExtraCommands(){
		this.addCommand({
			id: "theme-toggle",
			name: "Toggle Dark/Light Mode",
			//@ts-ignore
			icon: "feather-eye",
			callback: () => {
				//@ts-ignore
				this.app.getTheme() === "obsidian"
				//@ts-ignore
				? this.app.commands.executeCommandById("theme:use-light")
				//@ts-ignore
				: this.app.commands.executeCommandById("theme:use-dark");
			}
		});

		this.addCommand({
			id: "close-left-sidebar",
			name: "Close left Sidebar",
			icon: "feather-minimize",
			callback: () => {
				//@ts-ignore
				if(!this.app.workspace.leftRibbon.containerEl.hasClass("is-collapsed")){
					//@ts-ignore
					this.app.workspace.leftRibbon.collapseButtonEl.click();
				}
			}
		});

		this.addCommand({
			id: "open-left-sidebar",
			name: "Open left Sidebar",
			icon: "feather-maximize",
			callback: () => {
				//@ts-ignore
				if(this.app.workspace.leftRibbon.containerEl.hasClass("is-collapsed")){
					//@ts-ignore
					this.app.workspace.leftRibbon.collapseButtonEl.click();
				}
			}
		});

		this.addCommand({
			id: "close-right-sidebar",
			name: "Close right Sidebar",
			icon: "feather-minimize",
			callback: () => {
				//@ts-ignore
				if(!this.app.workspace.rightRibbon.containerEl.hasClass("is-collapsed")){
					//@ts-ignore
					this.app.workspace.rightRibbon.collapseButtonEl.click();
				}
			}
		});

		this.addCommand({
			id: "open-right-sidebar",
			name: "Open right Sidebar",
			icon: "feather-maximize",
			callback: () => {
				//@ts-ignore
				if(this.app.workspace.rightRibbon.containerEl.hasClass("is-collapsed")){
					//@ts-ignore
					this.app.workspace.rightRibbon.collapseButtonEl.click();
				}
			}
		});

		this.addCommand({
			id: "toggle-left-sidebar",
			name: "Toggle left Sidebar",
			icon: "feather-minimize",
			callback: () => {
				//@ts-ignore
				this.app.workspace.leftRibbon.collapseButtonEl.click();
			}
		});

		this.addCommand({
			id: "toggle-right-sidebar",
			name: "Toggle right Sidebar",
			icon: "feather-minimize",
			callback: () => {
				this.app.workspace.rightRibbon.collapseButtonEl.click();
			}
		});		
	}

	hideCommands() {
		//@ts-ignore
        const children: HTMLCollection = this.app.workspace.leftRibbon.ribbonActionsEl.children;
		for (let i = 0; i < children.length; i++) {
			if(this.settings.hiddenCommands.contains(children.item(i).getAttribute("aria-label"))) {
				(children.item(i) as HTMLElement).style.display = "none";
			}
		}
	}
}