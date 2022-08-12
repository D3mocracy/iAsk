import { Client, DMChannel, Guild, GuildMember, SelectMenuInteraction, TextChannel, User } from "discord.js";
import DataBase from "../db";
import Components from "../embedsAndComps/components";
import Embeds from "../embedsAndComps/Embeds";
import { Action, SetupConfig } from "../types";
import Utils from "../utils";
import LanguageHandler from "./language";
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

    private getMessageFromLangHandler(key: string) {
        return LanguageHandler.getMessageByLang(key, this.action.lang);
    }

    getManagerAsMember(): GuildMember {
        if (!this.action.guildId) return {} as any;
        return Utils.convertIDtoMemberFromGuild(this.bot, this.manager.id, this.action.guildId) as GuildMember;
    }

    async updateInteractionToMemberManageMenu(interaction: SelectMenuInteraction) {
        await interaction.update({ embeds: [Embeds.memberManageMessage(this.action.lang, this.member, interaction.values[0])], components: [await Components.memberManagementMenu(this.action.lang, this.getManagerAsMember())] });
    }

    static async getMemberIdFromDBByManagerId(manager: User) {
        const action = await DataBase.memberManagementCollection.findOne({ managerId: manager.id });
        if (!action) return;
        return action.memberId;
    }

    async createNewAction(channel: DMChannel) {
        this.action = { managerId: this.manager.id, memberId: this.member.id, lang: "en" }
        const user = Utils.convertIDtoUser(this.bot, this.member.id);
        if (!user) return;
        if ((await Utils.commonGuildCheck(this.bot, user, this.manager as User)).length !== 0) {
            await channel.send({ embeds: [Embeds.chooseGuildManageMember], components: [await Components.chooseGuildMenuManageMember("en", this.bot, user, this.manager)] });
        } else {
            await channel.send(this.getMessageFromLangHandler('noCommonGuildsError'));
        }

    }

    async chooseGuild(interaction: SelectMenuInteraction) {
        const guildId = interaction.values[0];
        const targetRankHandler = await RankHandler.createHandler(Utils.convertIDtoMemberFromGuild(this.bot, this.action.memberId, guildId));
        const managerRankHandler = await RankHandler.createHandler(Utils.convertIDtoMemberFromGuild(this.bot, this.action.managerId, guildId));
        const manager = Utils.convertIDtoMemberFromGuild(this.bot, this.action.managerId, guildId);
        if ((targetRankHandler.hasRank(Rank.MANAGER) && (!manager.permissions.has('ADMINISTRATOR'))) || managerRankHandler.hasRank(Rank.SUPERVISOR)) {
            await interaction.update({ content: LanguageHandler.getMessageByLang('dontHavePermissions', this.action.lang), embeds: [], components: [] })
            return;
        }
        this.action.guildId = guildId;
        const guildObj: SetupConfig = await DataBase.guildsCollection.findOne({ guildId }) as any;
        this.action.lang = guildObj.language || "en";
        this.updateInteractionToMemberManageMenu(interaction);
    }

    async updateToNoteMenu(interaction: SelectMenuInteraction) {
        await interaction.update({ embeds: [Embeds.noteMemberMessage(this.action.lang, this.action.memberId, this.action.guildId || "Guild Error")], components: [Components.memberNoteMenu(this.action.lang)] });
    }

    async insertDetailsToNoteManagerHanlder(memberId: string, managerId: string, guildId: string) {
        await DataBase.noteCollection.insertOne({ memberId, managerId, guildId });
    }

    async insertDetailsToManagementMessageHandler(interaction: SelectMenuInteraction) {
        await DataBase.managementMessageCollection.insertOne({ memberId: this.action.memberId, managerId: this.manager.id, guildId: this.action.guildId, sent: false, deleted: false });
        await interaction.update({ content: this.getMessageFromLangHandler('writeManagementMessage'), embeds: [], components: [] });
    }


}

export default ManageMemberHanlder;