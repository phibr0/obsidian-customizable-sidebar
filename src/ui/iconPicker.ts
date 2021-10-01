import { FuzzySuggestModal, Command, FuzzyMatch, setIcon, Notice } from "obsidian";
import CustomSidebarPlugin from "src/main";

export default class IconPicker extends FuzzySuggestModal<string>{
	plugin: CustomSidebarPlugin;
	command: Command;
	editMode: boolean;

	constructor(plugin: CustomSidebarPlugin, command: Command, editMode = false) {
		super(plugin.app);
		this.plugin = plugin;
		this.command = command;
		this.editMode = editMode;
		this.setPlaceholder("Pick an icon");
	}

	private cap(string: string): string {
		const words = string.split(" ");

		return words.map((word) => {
			return word[0].toUpperCase() + word.substring(1);
		}).join(" ");
	}

	getItems(): string[] {
		return this.plugin.iconList;
	}

	getItemText(item: string): string {
		return this.cap(item.replace("feather-", "").replace(/-/ig, " "));
	}

	renderSuggestion(item: FuzzyMatch<string>, el: HTMLElement): void {
		el.addClass("CS-icon-container");
		const div = createDiv({ cls: "CS-icon" });
		el.appendChild(div);
		setIcon(div, item.item);
		super.renderSuggestion(item, el);
	}

	async onChooseItem(item: string): Promise<void> {
		this.command.icon = item;

		if (!this.editMode) {
			this.plugin.addRibbonIcon(item, this.command.name, () => {
				//@ts-ignore
				this.app.commands.executeCommandById(this.command.id);
			})
			this.plugin.settings.sidebarCommands.push(this.command);
		} else {
			new Notice("You will need to restart Obsidian for the changes to take effect.")
		}

		await this.plugin.saveSettings();

		setTimeout(() => {
			dispatchEvent(new Event("CS-addedCommand"));
		}, 100);
	}

}
