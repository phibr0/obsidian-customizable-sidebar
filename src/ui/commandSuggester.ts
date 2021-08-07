import { FuzzySuggestModal, Command } from "obsidian";
import CustomSidebarPlugin from "src/main";
import IconPicker from "./iconPicker";

export default class CommandSuggester extends FuzzySuggestModal<Command> {

	constructor(private plugin: CustomSidebarPlugin) {
		super(plugin.app);
	}

	getItems(): Command[] {
		//@ts-ignore
		return this.app.commands.listCommands();
	}

	getItemText(item: Command): string {
		return item.name;
	}

	async onChooseItem(item: Command, evt: MouseEvent | KeyboardEvent): Promise<void> {
		if (item.icon) {
			this.plugin.addRibbonIcon(item.icon ?? "", item.name, () => {
				//@ts-ignore
				this.app.commands.executeCommandById(item.id);
			})
			this.plugin.settings.sidebarCommands.push(item);
			await this.plugin.saveSettings();
			setTimeout(() => {
				dispatchEvent(new Event("CS-addedCommand"));
			}, 100);
		} else {
			new IconPicker(this.plugin, item).open()
		}
	}

}