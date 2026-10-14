/** Native RTS society ledger. The simulation remains authoritative. */
class ZionStatus
{
    constructor()
    {
        this.panel = Engine.GetGUIObjectByName("zionStatusPanel");
        this.label = Engine.GetGUIObjectByName("zionStatusText");
        this.victoryProgress = Engine.GetGUIObjectByName("zionVictoryProgress");
        this.detailsPanel = Engine.GetGUIObjectByName("zionDetailsPanel");
        this.detailsTitle = Engine.GetGUIObjectByName("zionDetailsTitle");
        this.detailsLeft = Engine.GetGUIObjectByName("zionDetailsLeft");
        this.detailsRight = Engine.GetGUIObjectByName("zionDetailsRight");
        this.detailsFooter = Engine.GetGUIObjectByName("zionDetailsFooter");
        this.expanded = false;
        this.panel.onPress = this.toggle.bind(this);
        registerSimulationUpdateHandler(this.update.bind(this));
        this.update();
    }

    toggle()
    {
        if (this.panel.hidden)
            return;
        this.expanded = !this.expanded;
        this.detailsPanel.hidden = !this.expanded;
        this.panel.tooltip = this.expanded ?
            "Click to close the society ledger" :
            "Click to inspect all eight societal dimensions";
    }

    update()
    {
        const state = Engine.GuiInterfaceCall("GetZionStatus");
        this.panel.hidden = !state;
        // Show progress toward three consecutive qualifying native evaluations.
        // Losing eligibility resets this value in the authoritative simulation.
        const needed = state && Number.isFinite(state.needed) && state.needed > 0 ?
            state.needed : 0;
        const sustained = state && Number.isFinite(state.sustained) ?
            state.sustained : 0;
        this.victoryProgress.progress = needed ?
            Math.round(100 * Math.max(0, Math.min(1, sustained / needed))) : 0;
        this.victoryProgress.tooltip = "First Covenant: " +
            Math.max(0, sustained) + "/" + needed +
            " consecutive qualifying evaluations. Crises reset progress.";
        this.detailsPanel.hidden = !state || !this.expanded;
        if (!state)
            return;
        this.label.caption = "ZION  " + state.score + "/100  |  " +
            state.ageName + "\n" +
            "BALANCE  " + state.floor + "/100  |  " +
            state.sustained + "/" + state.needed + " evaluations\n" +
            "LOWEST  " + (state.weakest || "unknown") + "  |  click for details";
        this.panel.tooltip = this.expanded ?
            "Click to close the society ledger" :
            "Click to inspect all eight societal dimensions";

        const dims = state.dimensions || {};
        const changes = state.changes || {};
        const format = (label, key) => label + "  " +
            (dims[key] === undefined ? "—" : dims[key] + "/100") +
            (!changes[key] ? "" : "  (" + (changes[key] > 0 ? "+" : "") +
                changes[key] + ")");
        this.detailsTitle.caption = "SOCIETY  |  " + state.ageName;
        this.detailsLeft.caption = [
            format("Provision", "provision"),
            format("Dignity", "dignity"),
            format("Wisdom", "wisdom"),
            format("Ecology", "ecology")
        ].join("\n");
        this.detailsRight.caption = [
            format("Prosperity", "prosperity"),
            format("Freedom", "freedom"),
            format("Communion", "communion"),
            format("Resilience", "resilience")
        ].join("\n");
        this.detailsFooter.caption =
            "Trust  " + state.trust + "  |  War strain  " + state.warStrain +
            "\nCIVICS  " + (state.civicPath || "Not yet chosen") +
            "\nNEXT  " + (state.nextStep || "Maintain balanced flourishing") +
            "\nSustained  " + state.sustained + " of " + state.needed +
            " qualifying evaluations";
        this.detailsPanel.tooltip = "Eight dimensions of collective welfare; changes are per evaluation. " +
            "No single government or economic arrangement guarantees victory.";
    }
}
