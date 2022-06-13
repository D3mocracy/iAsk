import { Client, DMChannel, Guild, GuildMember, Message, MessageActionRow, SelectMenuInteraction, TextChannel, User } from "discord.js";
import DataBase from "../db";
import { ManagementDetails, Question, SetupConfig } from "../types";
import { MissingGuildIdError } from "../error"
import Config from "../config";
import Embeds from "../embedsAndComps/Embeds";
import Components from "../embedsAndComps/components";
import LogHandler from "./log";
import SetupHanlder from "./setup";
import Utils from "../utils";
import RankHandler, { Rank } from "./rank";
import LanguageHandler from "./language";

class ManageQuestionHandler {
    private question: Question = {} as any;
    private questionChannel: TextChannel = {} as any;
    private dmChannel: DMChannel;
    private lang: string = "en";
    private constructor(private bot: Client, private questionChannelId: string, dmChannel: any, private sender: User) {
        this.dmChannel = dmChannel;
    }

    static async createHandler(bot: Client, questionChannelId: any, dmChannel: any, sender: User) {
        const handler = new ManageQuestionHandler(bot, questionChannelId, dmChannel, sender);
        try {
            await handler.load();
        } catch (error) {
            handler.dmChannel.send(Config.cantFindMessageError);
            return;
        }
        return handler;
    }

    async save() {
        await DataBase.questionsCollection.updateOne({ channelId: this.questionChannelId }, { $set: this.question }, { upsert: true });
    }

    async load() {
        this.question = (await DataBase.questionsCollection.findOne({ channelId: this.questionChannelId, deleted: false }) as any) || this.question;
        if (!this.question.guildId) throw new MissingGuildIdError();
        this.questionChannel = await (await this.bot.guilds.fetch(this.question.guildId)).channels.fetch(this.questionChannelId) as any;
        const guildObj: SetupConfig = await DataBase.guildsCollection.findOne({ guildId: this.question.guildId }) as any;
        this.lang = guildObj.language || "en";
    }

    async updateEmbedAndCompManager(interaction: SelectMenuInteraction) {
        await interaction.update({ components: [await this.manageQuestionComp(this.lang) as MessageActionRow] });
    }

    async sendMemberQuestionManageMessage() {
        await this.dmChannel.send({ embeds: [Embeds.questionManageMember(this.question.lang, this.question.channelId as string)], components: [await this.manageQuestionComp(this.question.lang) as MessageActionRow] })
    }

    private getMessageFromLangHandler(key: string) {
        return LanguageHandler.getMessageByLang(key, this.lang);
    }

    async checkQuestionBelongToMember() {
        return this.sender.id === this.question.authorId;
    }

    async sendManageQuestionMessage(message: Message) {
        await message.reply({ embeds: [Embeds.questionManageMessage(this.lang, this.questionChannelId, `https://discord.com/channels/${this.question.guildId}/${this.question.channelId}`)], components: [await this.manageQuestionComp(this.lang) as MessageActionRow] });
    }

    async manageQuestionComp(lang: string) {
        if (!this.bot || !this.sender || !this.question.guildId) return;
        const member = Utils.convertIDtoMemberFromGuild(this.bot, this.sender.id, this.question.guildId) as GuildMember;
        return await Components.manageQuestionMenu(lang, member);
    }

    get questionObject() {
        return this.question;
    }

    async log(toolName: string) {
        const guild = await this.bot.guilds.fetch(this.question.guildId as string);
        const channelLog = await guild.channels.fetch((await SetupHanlder.getConfigObject(this.question.guildId as string)).manageToolLogChannelID)
        LogHandler.logManagerTool(channelLog as TextChannel, toolName, this.question.channelId as string, this.sender.tag);
    }

    async checkIfCanDelete(): Promise<boolean> {
        if (!this.question.guildId) return false;
        const guild = await this.bot.guilds.fetch(this.question.guildId);
        const channel = await guild.channels.fetch(this.questionChannelId);
        const rankHandler = await RankHandler.createHandler(Utils.convertIDtoMemberFromGuild(this.bot, this.sender.id, guild.id));
        if (!channel) return false;
        const hours = Math.floor((new Date().valueOf() - channel.createdAt.valueOf()) / 3600000);

        if (rankHandler.hasRank(Rank.SUPERVISOR) || rankHandler.hasRank(Rank.MANAGER)) return true;
        const messagePrefix = this.getMessageFromLangHandler('questionDeleteMemberOrTrusted');
        if (rankHandler.hasRank(Rank.TRUSTED)) {
            if (hours < 12) {
                await this.dmChannel.send(`${messagePrefix.trusted} ${hours}`);
            }
            return hours > 12;
        }
        if (rankHandler.hasRank(Rank.MEMBER)) {
            if (hours < 24) {
                await this.dmChannel.send(`${messagePrefix.member} ${hours}`);
            }
            return hours > 24;
        }
        return true;

    }

    async deleteQuestion() {
        if (!this.question.deleted) {
            if (!this.question.guildId) return;
            const guild = await this.bot.guilds.fetch(this.question.guildId);
            if (!(await this.checkIfCanDelete())) return;
            const questionLogChannel = guild.channels.cache.get((await SetupHanlder.getConfigObject(this.question.guildId)).questionLogChannelID) as any;
            await LogHandler.logQuestionChannel(this.questionChannel, questionLogChannel)
            await this.questionChannel.delete();
            this.question.deleted = true;
            await this.dmChannel.send(this.getMessageFromLangHandler('channelDeletedMessage'));
        } else {
            return;
        }
    }

    async lockQuestion() {
        if (!this.question.lock) {
            this.question.lock = true;
            await this.questionChannel.send({ embeds: [Embeds.lockedEmbedMessage(this.lang)] });
            let guild = await this.bot.guilds.fetch(this.questionChannel.guildId);
            await this.questionChannel.permissionOverwrites.create(guild.roles.everyone, { SEND_MESSAGES: false });
        } else {
            await this.dmChannel.send(this.getMessageFromLangHandler('alreadyLocked'));
            return;
        }
    }

    async unlockQuestion() {
        if (this.question.lock) {
            this.question.lock = false;
            await this.questionChannel.send({ embeds: [Embeds.unlockQuestion(this.lang)] });
            let guild = await this.bot.guilds.fetch(this.questionChannel.guildId);
            await this.questionChannel.permissionOverwrites.create(guild.roles.everyone, { SEND_MESSAGES: true });
        } else {
            await this.dmChannel.send(this.getMessageFromLangHandler('alreadyUnlocked'));
            return;
        }
    };

    async revealUserTag() {
        const memberTag = (await (await this.bot.guilds.fetch(this.question.guildId as string)).members.fetch(this.question.authorId)).user.tag;
        await this.dmChannel.send(`${memberTag}`)
    }

    async logQuestion() {
        LogHandler.logQuestionChannel(this.questionChannel, this.dmChannel);
    }

    async chooseChangeDetail() {
        await this.dmChannel.send({ embeds: [Embeds.changeDetails(this.lang, this.questionChannelId)], components: [Components.changeDetails(this.lang)] })
    }

    async changeDetail(interaction: SelectMenuInteraction) {
        const configMsg = this.getMessageFromLangHandler('changeDetailsMessages');
        const messages: any = {
            "change-title": configMsg.title,
            "change-description": configMsg.title,
        }
        await DataBase.detailsManagementCollection.updateOne({ managerId: this.sender.id }, { $set: { status: interaction.values[0], channelId: this.questionChannelId } }, { upsert: true });
        await this.dmChannel.send(messages[interaction.values[0]]);
        await interaction.update({ components: [Components.changeDetails(this.lang)] });

    }

    async isStaff(): Promise<boolean> {
        if (!this.question.guildId) return false;
        const member = await (await this.bot.guilds.fetch(this.question.guildId)).members.fetch(this.sender.id);
        const rankHandler = await RankHandler.createHandler(member);
        return rankHandler.hasRank(Rank.MANAGER) || rankHandler.hasRank(Rank.SUPERVISOR);
    }

}

export default ManageQuestionHandler;