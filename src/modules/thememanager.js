import {Config} from "data";
import AddonManager from "./addonmanager";
import Settings from "./settingsmanager";
import DOMManager from "./dommanager";
import Strings from "./strings";

import Toasts from "../ui/toasts";
import Modals from "../ui/modals";
import SettingsRenderer from "../ui/settings";

const path = require("path");

export default new class ThemeManager extends AddonManager {
    get name() {return "ThemeManager";}
    get moduleExtension() {return ".css";}
    get extension() {return ".theme.css";}
    get addonFolder() {return path.resolve(Config.dataPath, "themes");}
    get prefix() {return "theme";}

    initialize() {
        const errors = super.initialize();
        Settings.registerPanel("themes", Strings.Panels.themes, {element: () => SettingsRenderer.getAddonPanel(Strings.Panels.themes, this.addonList, this.state, {
            folder: this.addonFolder,
            onChange: this.toggleTheme.bind(this),
            reload: this.reloadTheme.bind(this),
            refreshList: this.updateThemeList.bind(this)
        })});
        return errors;
    }

    /* Aliases */
    updateThemeList() {return this.updateList();}
    loadAllThemes() {return this.loadAllAddons();}

    enableTheme(idOrAddon) {return this.enableAddon(idOrAddon);}
    disableTheme(idOrAddon) {return this.disableAddon(idOrAddon);}
    toggleTheme(id) {return this.toggleAddon(id);}

    unloadTheme(idOrFileOrAddon) {return this.unloadAddon(idOrFileOrAddon);}

    loadTheme(filename) {
        const error = this.loadAddon(filename);
        if (error) Modals.showAddonErrors({themes: [error]});
    }

    reloadTheme(idOrFileOrAddon) {
        const error = this.reloadAddon(idOrFileOrAddon);
        if (error) Modals.showAddonErrors({themes: [error]});
    }

    /* Overrides */
    getFileModification(module, fileContent, meta) {
        meta.css = fileContent;
        return `module.exports = ${JSON.stringify(meta)};`;
    }

    startAddon(id) {return this.addTheme(id);}
    stopAddon(id) {return this.removeTheme(id);}

    addTheme(idOrAddon) {
        const addon = typeof(idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        if (!addon) return;
        DOMManager.injectTheme(addon.id, addon.css);
        Toasts.show(`${addon.name} v${addon.version} has been applied.`);
    }

    removeTheme(idOrAddon) {
        const addon = typeof(idOrAddon) == "string" ? this.addonList.find(p => p.id == idOrAddon) : idOrAddon;
        if (!addon) return;
        DOMManager.removeTheme(addon.id);
        Toasts.show(`${addon.name} v${addon.version} has been removed.`);
    }
};