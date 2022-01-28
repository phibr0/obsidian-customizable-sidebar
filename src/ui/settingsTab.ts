import { PluginSettingTab, App, Setting, setIcon, Command, Notice } from "obsidian";
import CustomSidebarPlugin from "src/main";
import CommandSuggester from "./commandSuggester";
import IconPicker from "./iconPicker";

export interface CustomSidebarSettings {
    sidebarCommands: Command[];
    hiddenCommands: string[];
}

export const DEFAULT_SETTINGS: CustomSidebarSettings = {
    sidebarCommands: [],
    hiddenCommands: [],
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
            .setDesc("Add a new command to the left Sidebar Ribbon")
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
                .addExtraButton(bt => {
                    bt.setIcon("trash")
                        .setTooltip("Remove Command")
                        .onClick(async () => {
                            this.plugin.settings.sidebarCommands.remove(c);
                            await this.plugin.saveSettings();
                            this.display();
                            const ribbonButton = Array.from(this.leftRibbonPanel.children)
                                .find((btn) => c.name === btn.getAttribute('aria-label'))
                            this.leftRibbonPanel.removeChild(ribbonButton);
                        })
                })
                .addExtraButton(bt => {
                    bt.setIcon("gear")
                        .setTooltip("Edit Icon")
                        .onClick(() => {
                            new IconPicker(this.plugin, c, true).open();
                        })
                });
            setting.nameEl.prepend(iconDiv);
            setting.nameEl.addClass("CS-flex");
        });

        //@ts-ignore
        const children: HTMLCollection = this.app.workspace.leftRibbon.ribbonActionsEl.children;
        for (let i = 0; i < children.length; i++) {
            if (!this.plugin.settings.sidebarCommands.contains(this.plugin.settings.sidebarCommands.find(c => c.name === (children.item(i) as HTMLElement).getAttribute("aria-label")))) {
                new Setting(containerEl)
                    .setName("Hide " + (children.item(i) as HTMLElement).getAttribute("aria-label") + "?")
                    .addToggle(cb => {
                        cb.setValue((children.item(i) as HTMLElement).style.display === "none")
                        cb.onChange(async value => {
                            if(value === true) {
                                (children.item(i) as HTMLElement).style.display = "none";
                                this.plugin.settings.hiddenCommands.push((children.item(i) as HTMLElement).getAttribute("aria-label"));
                                await this.plugin.saveSettings();
                            } else {
                                (children.item(i) as HTMLElement).style.display = "flex";
                                this.plugin.settings.hiddenCommands.remove((children.item(i) as HTMLElement).getAttribute("aria-label"));
                                await this.plugin.saveSettings();
                            }
                        });
                    });
            }
        }

        new Setting(containerEl)
            .setName('Donate')
            .setDesc('If you like this plugin, consider donating to support continued development:')
            .setClass("AT-extra")
            .addButton((bt) => {
                bt.buttonEl.outerHTML = `<a href="https://www.buymeacoffee.com/phibr0"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=phibr0&button_colour=5F7FFF&font_colour=ffffff&font_family=Inter&outline_colour=000000&coffee_colour=FFDD00"></a>`;
            });

    }

    private get leftRibbonPanel(): HTMLElement {
        // @ts-ignore `ribbonActionsEl` is not defined in api
        return this.app.workspace.leftRibbon.ribbonActionsEl as HTMLElement;
    }
}
