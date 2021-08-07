import { PluginSettingTab, App, Setting, setIcon, Command, Notice } from "obsidian";
import CustomSidebarPlugin from "src/main";
import CommandSuggester from "./commandSuggester";

export interface CustomSidebarSettings {
    sidebarCommands: Command[];
}

export const DEFAULT_SETTINGS: CustomSidebarSettings = {
    sidebarCommands: [],
}

export default class CustomSidebarSettingsTab extends PluginSettingTab {
    plugin: CustomSidebarPlugin;

    constructor(app: App, plugin: CustomSidebarPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        addEventListener("CS-addedCommand", () => {
            this.display();
        });
    }

    display(): void {
        let { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Customizable Sidebar Settings' });

        new Setting(containerEl)
            .setName("Add Command to Sidebar")
            .setDesc("Add a new Command to the left Sidebar Ribbon")
            .addButton((bt) => {
                bt.setButtonText("Add Command")
                    .onClick(() => {
                        new CommandSuggester(this.plugin).open();
                    });
            });

        this.plugin.settings.sidebarCommands.forEach(c => {
            const iconDiv = createDiv({ cls: "CS-settings-icon" });
            setIcon(iconDiv, c.icon, 20);
            const setting = new Setting(containerEl)
                .setName(c.name)
                .addButton(bt => {
                    bt.setButtonText("Remove Command")
                        .onClick(async () => {
                            this.plugin.settings.sidebarCommands.remove(c);
                            await this.plugin.saveSettings();
                            this.display();
                            new Notice("You will need to restart Obsidian for the Command to dissapear.")
                        })
                });
            setting.nameEl.prepend(iconDiv);
            setting.nameEl.addClass("CS-flex");
        })

        new Setting(containerEl)
            .setName('Donate')
            .setDesc('If you like this Plugin, consider donating to support continued development:')
            .setClass("AT-extra")
            .addButton((bt) => {
                bt.buttonEl.outerHTML = `<a href="https://www.buymeacoffee.com/phibr0"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=phibr0&button_colour=5F7FFF&font_colour=ffffff&font_family=Inter&outline_colour=000000&coffee_colour=FFDD00"></a>`;
            });
    }
}



