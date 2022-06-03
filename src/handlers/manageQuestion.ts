import { Client, DMChannel, Guild, GuildMember, MessageActionRow, TextChannel, User } from "discord.js";
import DataBase from "../db";
import { ManagementDetails, Question } from "../types";
import { MissingGuildIdError } from "../error"
import Config from "../config";
import Embeds from "../embedsAndComps/Embeds";
import Components from "../embedsAndComps/components";
import LogHandler from "./log";
import SetupHanlder from "./setup";
import Utils from "../utils";
import RankHandler, { Rank } from "./rank";

class ManageQuestionHandler {
    private question: Question = {} as any;
    private questionChannel: TextChannel = {} as any;
    private dmChannel: DMChannel;
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
    }

    async checkQuestionBelongToMember() {
        return this.sender.id === this.question.authorId;
    }

    async memberManageQuestionComp(hours: number) {
        if (!this.bot || !this.sender || !this.question.guildId) return;
        const member = Utils.convertIDtoMemberFromGuild(this.bot, this.sender.id, this.question.guildId) as GuildMember;

    }


    async manageQuestionComp() {
        if (!this.bot || !this.sender || !this.question.guildId) return;
        const member = Utils.convertIDtoMemberFromGuild(this.bot, this.sender.id, this.question.guildId) as GuildMember;
        return await Components.manageQuestionMenu(member);
    }

    get questionObject() {
        return this.question;
    }

    async log(toolName: string) {
        const guild = await this.bot.guilds.fetch(this.question.guildId as string);
        const channelLog = await guild.channels.fetch((await SetupHanlder.getConfigObject(this.question.guildId as string)).manageToolLogChannelID)
        LogHandler.logManagerTool(this.bot, channelLog as TextChannel, toolName, this.question.channelId as string, this.sender.tag);
    }

    async checkIfCanDelete(): Promise<boolean> {
        if (!this.question.guildId) return false;
        const guild = await this.bot.guilds.fetch(this.question.guildId);
        const channel = await guild.channels.fetch(this.questionChannelId);
        const rankHandler = await RankHandler.createHandler(Utils.convertIDtoMemberFromGuild(this.bot, this.sender.id, guild.id));
        if (!channel) return false;
        const hours = Math.floor((new Date().valueOf() - channel.createdAt.valueOf()) / 3600000);

        if (rankHandler.hasRank(Rank.SUPERVISOR) || rankHandler.hasRank(Rank.MANAGER)) return true;

        if (rankHandler.hasRank(Rank.TRUSTED)) {
            if (hours < 12) {
                await this.dmChannel.send(`As a trusted member you can delete a question after 12 hours, its been only ${hours}`);
            }
            return hours > 12;
        }
        if (rankHandler.hasRank(Rank.MEMBER)) {
            if (hours < 24) {
                await this.dmChannel.send(`As a member you can delete a question after 24 hours, its been have only ${hours}`);
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
            this.dmChannel.send("Channel Deleted")
        } else {
            return;
        }
    }

    async lockQuestion() {
        if (!this.question.lock) {
            this.question.lock = true;
            await this.questionChannel.send({ embeds: [Embeds.lockQuestion] });
            let guild = await this.bot.guilds.fetch(this.questionChannel.guildId);
            await this.questionChannel.permissionOverwrites.create(guild.roles.everyone, { SEND_MESSAGES: false });
        } else {
            await this.dmChannel.send("Question is already locked")
            return;
        }
    }

    async unlockQuestion() {
        if (this.question.lock) {
            this.question.lock = false;
            await this.questionChannel.send({ embeds: [Embeds.unlockQuestion] });
            let guild = await this.bot.guilds.fetch(this.questionChannel.guildId);
            await this.questionChannel.permissionOverwrites.create(guild.roles.everyone, { SEND_MESSAGES: true });
        } else {
            await this.dmChannel.send("Question is already unlocked")
            return;
        }
    };

    async revealUserTag() {
        const memberTag = (await (await this.bot.guilds.fetch(this.question.guildId as string)).members.fetch(this.question.authorId)).user.tag;
        await this.dmChannel.send(`The user is ${memberTag}`)
    }

    async logQuestion() {
        LogHandler.logQuestionChannel(this.questionChannel, this.dmChannel);
    }

    async chooseChangeDetail() {
        await this.dmChannel.send({ embeds: [Embeds.changeDetails(this.questionChannelId)], components: [Components.changeDetails()] })
    }

    async changeDetail(detail: string) {
        const messages: any = {
            "change-title": "Please type a new title",
            "change-description": "Please type a new description",
        }
        await DataBase.detailsManagementCollection.updateOne({ managerId: this.sender.id }, { $set: { status: detail, channelId: this.questionChannelId } }, { upsert: true });
        this.dmChannel.send(messages[detail]);

    }

    async switchAnonymous() {
        this.question.anonymous = !this.question.anonymous;
    }

}

export default ManageQuestionHandler;