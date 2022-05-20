import { Client, DMChannel, Guild, SelectMenuInteraction, TextChannel, User } from "discord.js";
import DataBase from "../db";
import Components from "../embedsAndComps/components";
import Embeds from "../embedsAndComps/Embeds";
import { Action } from "../types";
import Utils from "../utils";

class ManageMemberHanlder {
    private action: Action = {} as Action;
    private constructor(private bot: Client, private manager: User, private member: User) { }

    static async createHandler(bot: Client, manager: User, member: User) {
        const handler = new ManageMemberHanlder(bot, manager, member);
        await handler.load();
        return handler;
    }

    async load() {
        this.action = await DataBase.memberManagementCollection.findOne({ managerId: this.manager.id }) as any;
    }

    async save() {
        await DataBase.memberManagementCollection.updateOne({ managerId: this.manager.id }, { $set: this.action }, { upsert: true });
    }

    static async getMemberIdFromDB(manager: User) {
        const action = await DataBase.memberManagementCollection.findOne({ managerId: manager.id });
        if (!action) return;
        return action.memberId;
    }

    async createNewAction(channel: DMChannel) {
        this.action = { managerId: this.manager.id, memberId: this.member.id }
        const user = Utils.convertIDtoUser(this.bot, this.member.id);
        if (!user) return;
        await channel.send({ embeds: [Embeds.chooseGuildManageMember], components: [Components.chooseGuildMenuManageMember(this.bot, user, this.manager)] });
    }

    async chooseGuild(guildId: string) {
        this.action.guildId = guildId;
    }

    static async exit(managerId: string) {
        await DataBase.memberManagementCollection.deleteOne({ managerId });
    }

    async kickMember(interaction: SelectMenuInteraction) {
        if (!this.action.guildId) return;
        const guild = await this.bot.guilds.fetch(this.action.guildId);
        await (await guild.members.fetch(this.action.memberId)).kick("iAsk kick - kicked by management");
        await interaction.update({ content: "Kicked member!" });
    }

    async banMember(interaction: SelectMenuInteraction) {
        if (!this.action.guildId) return;
        const guild = await this.bot.guilds.fetch(this.action.guildId);
        await (await guild.members.fetch(this.action.memberId)).ban();
        await interaction.update({ content: "Banned member!" });
    }

    async updateToBlockMenu(interaction: SelectMenuInteraction) {
        await interaction.update({ embeds: [Embeds.blockMemberMessage(this.action.memberId, this.action.guildId as string)], components: [Components.memberBlockMenu()] });
    }

    async blockMember(interaction: SelectMenuInteraction) {
        if (!this.action.guildId) return;
        const guild = await this.bot.guilds.fetch(this.action.guildId);
        const convertToTime: any = {
            "block-3h": 1000 * 60 * 60 * 3,
            "block-1d": 1000 * 60 * 60 * 24,
            "block-3d": 1000 * 60 * 60 * 24 * 3,
            "block-1w": 1000 * 60 * 60 * 24 * 7,
            "block-1m": 3.9 * 7 * 60 * 60 * 24 * 1000,
            "block-unblock": null,
        }
        await (await guild.members.fetch(this.action.memberId)).timeout(convertToTime[interaction.values[0]]);
        await interaction.update({ content: convertToTime[interaction.values[0]] ? "Member blocked!" : "Unblocked member", embeds: [], components: [] })

    }

    async updateToNoteMenu(interaction: SelectMenuInteraction) {
        await interaction.update({ embeds: [Embeds.noteMemberMessage(this.action.memberId, this.action.guildId || "Guild Error")], components: [Components.memberNoteMenu()] });
    }

    async insertDetailsToNoteManagerHanlder(memberId: string, managerId: string, guildId: string) {
        await DataBase.noteCollection.insertOne({ memberId, managerId, guildId });
    }
}

export default ManageMemberHanlder;