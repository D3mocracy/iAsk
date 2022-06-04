import { Client, DMChannel, Guild, GuildMember, SelectMenuInteraction, TextChannel, User } from "discord.js";
import DataBase from "../db";
import Components from "../embedsAndComps/components";
import Embeds from "../embedsAndComps/Embeds";
import { Action } from "../types";
import Utils from "../utils";
import RankHandler, { Rank } from "./rank";

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

    getManagerAsMember(): GuildMember {
        if (!this.action.guildId) return {} as any;
        return Utils.convertIDtoMemberFromGuild(this.bot, this.manager.id, this.action.guildId) as GuildMember;
    }

    async updateInteractionToMemberManageMenu(interaction: SelectMenuInteraction) {
        await interaction.update({ embeds: [Embeds.memberManageMessage(this.member, interaction.values[0])], components: [await Components.memberManagementMenu(this.getManagerAsMember())] });

    }

    static async getMemberIdFromDBByManagerId(manager: User) {
        const action = await DataBase.memberManagementCollection.findOne({ managerId: manager.id });
        if (!action) return;
        return action.memberId;
    }

    async createNewAction(channel: DMChannel) {
        this.action = { managerId: this.manager.id, memberId: this.member.id }
        const user = Utils.convertIDtoUser(this.bot, this.member.id);
        if (!user) return;
        if ((await Utils.commonGuildCheck(this.bot, user, this.manager as User)).length !== 0) {
            await channel.send({ embeds: [Embeds.chooseGuildManageMember], components: [await Components.chooseGuildMenuManageMember(this.bot, user, this.manager)] });
        } else {
            await channel.send("Error: can't find common guild between u 2, maybe you should invite him...")
        }

    }

    async chooseGuild(guildId: string) {
        this.action.guildId = guildId;
    }

    async isStaff(): Promise<boolean> {
        if (!this.action.guildId) return false;
        const member = await (await this.bot.guilds.fetch(this.action.guildId)).members.fetch(this.manager.id);
        const rankHandler = await RankHandler.createHandler(member);
        return rankHandler.hasRank(Rank.SUPERVISOR) || rankHandler.hasRank(Rank.MANAGER);
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
        await interaction.update({ embeds: [Embeds.blockMemberMessage(this.action.memberId, this.action.guildId as string)], components: [await Components.memberBlockMenu(this.getManagerAsMember())] });
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

    async insertDetailsToManagementMessageHandler(interaction: SelectMenuInteraction) {
        await DataBase.managementMessageCollection.insertOne({ memberId: this.action.memberId, managerId: this.manager.id, guildId: this.action.guildId, sent: false, deleted: false });
        await interaction.update({ content: "Type the message please", embeds: [], components: [] });
    }


}

export default ManageMemberHanlder;