import { Platform, Plugin, setIcon } from 'obsidian';
import { addFeatherIcons } from './ui/icons';
import CustomSidebarSettingsTab, { CustomSidebarSettings, DEFAULT_SETTINGS } from './ui/settingsTab';

class PinSidebarSupport {
	pinLeft?: HTMLElement;
	pinRight?: HTMLElement;
}

export default class CustomSidebarPlugin extends Plugin {
	settings: CustomSidebarSettings;
	pinSidebarSupport?: PinSidebarSupport;
	iconList: string[] = ["any-key", "audio-file", "blocks", "bold-glyph", "bracket-glyph", "broken-link", "bullet-list", "bullet-list-glyph", "calendar-with-checkmark", "check-in-circle", "check-small", "checkbox-glyph", "checkmark", "clock", "cloud", "code-glyph", "create-new", "cross", "cross-in-box", "crossed-star", "csv", "deleteColumn", "deleteRow", "dice", "document", "documents", "dot-network", "double-down-arrow-glyph", "double-up-arrow-glyph", "down-arrow-with-tail", "down-chevron-glyph", "enter", "exit-fullscreen", "expand-vertically", "filled-pin", "folder", "formula", "forward-arrow", "fullscreen", "gear", "go-to-file", "hashtag", "heading-glyph", "help", "highlight-glyph", "horizontal-split", "image-file", "image-glyph", "indent-glyph", "info", "insertColumn", "insertRow", "install", "italic-glyph", "keyboard-glyph", "languages", "left-arrow", "left-arrow-with-tail", "left-chevron-glyph", "lines-of-text", "link", "link-glyph", "logo-crystal", "magnifying-glass", "microphone", "microphone-filled", "minus-with-circle", "moveColumnLeft", "moveColumnRight", "moveRowDown", "moveRowUp", "note-glyph", "number-list-glyph", "open-vault", "pane-layout", "paper-plane", "paused", "pdf-file", "pencil", "percent-sign-glyph", "pin", "plus-with-circle", "popup-open", "presentation", "price-tag-glyph", "quote-glyph", "redo-glyph", "reset", "right-arrow", "right-arrow-with-tail", "right-chevron-glyph", "right-triangle", "run-command", "search", "sheets-in-box", "sortAsc", "sortDesc", "spreadsheet", "stacked-levels", "star", "star-list", "strikethrough-glyph", "switch", "sync", "sync-small", "tag-glyph", "three-horizontal-bars", "trash", "undo-glyph", "unindent-glyph", "up-and-down-arrows", "up-arrow-with-tail", "up-chevron-glyph", "uppercase-lowercase-a", "vault", "vertical-split", "vertical-three-dots", "wrench-screwdriver-glyph"];

	async onload() {
		console.log('loading CustomSidebarPlugin %s', this.manifest.version);

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

		this.app.workspace.onLayoutReady(() => {
			this.hideCommands();
			this.sidebarPins();
		});
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

	sidebarPins() {
		if ( Platform.isMobile) {
			// don't do any of this if we're on mobile
			return;
		}
		if (this.settings.pinSidebar === undefined && this.pinSidebarSupport) {
			// clean up any sidebar pins & related classes if present

			const leftParent = this.pinSidebarSupport.pinLeft.parentElement;
			leftParent.removeChild(this.pinSidebarSupport.pinLeft);
			delete this.pinSidebarSupport.pinLeft;

			const rightParent = this.pinSidebarSupport.pinRight.parentElement;
			rightParent.removeChild(this.pinSidebarSupport.pinRight);
			delete this.pinSidebarSupport.pinRight;

			this.getSidebarContainer(true).removeClass("is-pinned");
			this.getSidebarContainer(true).removeClass("is-floating");

			this.getSidebarContainer(false).removeClass("is-pinned");
			this.getSidebarContainer(false).removeClass("is-floating");

		} else if (this.settings.pinSidebar) {
			// create sidebar pin buttons & related classes

			if ( this.pinSidebarSupport === undefined ) {
				// Commands are added once (not removed?)
				this.addCommand({
					id: "pin-left-sidebar",
					name: "Toggle pin left Sidebar",
					icon: "pin",
					callback: async () => this.toggleLeftSidebar()
				});

				this.addCommand({
					id: "pin-right-sidebar",
					name: "Toggle pin right Sidebar",
					icon: "pin",
					callback: async () => this.toggleRightSidebar()
				});
			}

			//@ts-ignore
			const leftParent: HTMLElement = this.app.workspace.leftRibbon.containerEl;
			let pinLeft = leftParent.children.namedItem("left-pin-sidebar") as HTMLElement;
			if (pinLeft == null) {
				pinLeft = leftParent.createDiv({
					cls: "pin-sidebar pin-left-sidebar",
					attr: {
						name: "left-pin-sidebar"
					}});
				pinLeft.addEventListener("click", async (e) => {
					this.toggleLeftSidebar();
					return e.preventDefault();
				});
				leftParent.insertBefore(pinLeft, leftParent.firstChild);
			}

			//@ts-ignore
			const rightParent: HTMLElement = this.app.workspace.rightRibbon.containerEl;
			let pinRight = rightParent.children.namedItem("right-pin-sidebar") as HTMLElement;
			if ( pinRight == null ) {
				pinRight = rightParent.createDiv({
					cls: "pin-sidebar pin-right-sidebar",
					attr: {
						name: "right-pin-sidebar",
					}});
				pinRight.addEventListener("click", async (e) => {
					this.toggleRightSidebar();
					return e.preventDefault();
				});
				rightParent.insertBefore(pinRight, rightParent.firstChild);
			}

			// Save elements for reference/toggle
			this.pinSidebarSupport = {
				pinLeft,
				pinRight
			};

			this.setAttributes(pinLeft,
					this.getSidebarContainer(true),
					this.settings.pinSidebar.left === undefined ? true : this.settings.pinSidebar.left);

			this.setAttributes(pinRight,
					this.getSidebarContainer(false),
					this.settings.pinSidebar.right === undefined ? true : this.settings.pinSidebar.right);
		}
	}

	async toggleLeftSidebar() {
		if ( this.settings.pinSidebar && this.pinSidebarSupport ) {
			this.settings.pinSidebar.left = ! this.settings.pinSidebar.left;
			this.setAttributes(this.pinSidebarSupport.pinLeft,
				this.getSidebarContainer(true),
				this.settings.pinSidebar.left);
			await this.saveSettings();
		}
	}

	async toggleRightSidebar() {
		if ( this.settings.pinSidebar && this.pinSidebarSupport ) {
			this.settings.pinSidebar.right = ! this.settings.pinSidebar.right;
			this.setAttributes(this.pinSidebarSupport.pinRight,
				this.getSidebarContainer(false),
				this.settings.pinSidebar.right);
			await this.saveSettings();
		}
	}

	setAttributes(pin: HTMLElement, sidebar: HTMLElement, value: boolean) {
		if ( value ) {
			setIcon(pin, "filled-pin");

			pin.addClass("is-pinned");
			sidebar.addClass("is-pinned");

			pin.removeClass("is-floating");
			sidebar.removeClass("is-floating");
		} else {
			setIcon(pin, "pin");

			pin.removeClass("is-pinned");
			sidebar.removeClass("is-pinned");

			pin.addClass("is-floating");
			sidebar.addClass("is-floating");
		}
	}

	getSidebarContainer(leftSplit: boolean) {
		if ( leftSplit ) {
			//@ts-ignore
			return this.app.workspace.leftSplit.containerEl;
		}
		//@ts-ignore
		return this.app.workspace.rightSplit.containerEl;
	}
}
