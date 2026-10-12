/** Native RTS society HUD. Read-only: the simulation remains authoritative. */
class ZionStatus
{
    constructor()
    {
        this.panel = Engine.GetGUIObjectByName("zionStatusPanel");
        this.label = Engine.GetGUIObjectByName("zionStatusText");
        registerSimulationUpdateHandler(this.update.bind(this));
        this.update();
    }

    update()
    {
        const state = Engine.GuiInterfaceCall("GetZionStatus");
        this.panel.hidden = !state;
        if (!state)
            return;

        this.label.caption = "ZION  " + state.score + "/100  |  " +
            state.ageName + "\n" + "BALANCE  " + state.floor + "/100" +
            "     " + state.sustained + "/" + state.needed;

        const names = {
            "provision":"Provision", "prosperity":"Prosperity",
            "dignity":"Dignity", "freedom":"Freedom",
            "wisdom":"Wisdom", "communion":"Communion",
            "ecology":"Ecology", "resilience":"Resilience"
        };
        this.panel.tooltip = "ZION A.D. — SOCIETY\n" +
            Object.entries(state.dimensions).map(
                ([key, value]) => names[key] + ": " + value + "/100").join("\n") +
            "\nTrust: " + state.trust +
            "  |  War strain: " + state.warStrain +
            "\nMaintain balanced flourishing through " +
            state.needed + " evaluations to complete the first covenant.";
    }
}
