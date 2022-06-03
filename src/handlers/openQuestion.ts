import { CategoryChannelResolvable, Client, DMChannel, Guild, GuildMember, User, Util } from "discord.js";
import Config from "../config";
import Components from "../embedsAndComps/components";
import DataBase from "../db";
import Embeds from "../embedsAndComps/Embeds";
import { Question } from "../types";
import { MissingGuildIdError } from "../error";
import SetupHanlder from "./setup";
import RankHandler, { Rank } from "./rank";
import Utils from "../utils";

class OpenQuestionHandler {
    private channel: DMChannel;
    private question: Question;
    constructor(private bot: Client, private user: User, channel: any) {
        this.channel = channel; // TS issues
        this.question = { authorId: this.user.id, deleted: false }
    }

    static async createHandler(bot: Client, user: User, channel: any) {
        const handler = new OpenQuestionHandler(bot, user, channel);
        await handler.load();
        return handler;
    }

    async iHaveAQuestion() {
        this.question.started = true;
        this.question.lock = false;
        await this.channel.send({ embeds: [Embeds.chooseGuildOpenQuestion], components: [await Components.chooseGuildMenuOpenQuestion(this.bot, this.user)] });
    }

    async isReachedLimit() {
        const qList = await DataBase.questionsCollection.find({ authorId: this.user.id, guildId: this.question.guildId, deleted: false }).toArray();
        return qList.length === (await SetupHanlder.getConfigObject(this.question.guildId as string)).maxQuestions;
    }

    async chooseGuild(guildId: string) {
        this.question.guildId = guildId;
    }

    async chooseTitle(title: string) {
        this.question.title = title;
        await this.channel.send(Config.chooseDescriptionMessage);
    }

    async chooseDescription(description: string) {
        this.question.description = description;
        await this.channel.send({ content: Config.chooseAnonymousMessage, components: [Components.chooseToBeAnonymousButtons()] });
    }

    async chooseAnonymous(anonymous: boolean) {
        this.question.anonymous = anonymous;
        await this.channel.send({
            content: Config.askSureMessage,
            embeds: [Embeds.questionMessage(this.question.title || "Error 404", this.question.description || "Error 404", this.question.anonymous ? "Anonymous" : `${this.user.tag}`)],
            components: [Components.chooseSureMessage()]
        });
    }

    async deleteQuestion() {
        this.question.deleted = true;
    }

    async createChannelOnGuild() {
        if (!this.question.guildId) throw new MissingGuildIdError();
        const guild = await this.bot.guilds.fetch(this.question.guildId);
        const questionCatagory = await this.bot.channels.fetch((await SetupHanlder.getConfigObject(this.question.guildId)).questionCatagory) as CategoryChannelResolvable;
        const guildChannel = await guild.channels.create(this.question.title || "Error 404", { type: "GUILD_TEXT", parent: questionCatagory });
        this.question.channelId = guildChannel.id;
        await this.channel.send({ embeds: [Embeds.questionMessage(this.question.title || "Error 404", this.question.description || "Error 404", this.question.anonymous ? "Anonymous" : `${this.user.tag}`, this.question.channelId, this.question.guildId)] })
        await guildChannel.send({ embeds: [Embeds.questionMessage(this.question.title || "Error 404", this.question.description || "Error 404", this.question.anonymous ? "Anonymous" : `${this.user.tag}`, this.question.channelId, this.question.guildId)] });
        const rankHandler = await RankHandler.createHandler(Utils.convertIDtoMemberFromGuild(this.bot, this.user.id, guild.id));
        await (await guildChannel.send(`${rankHandler.getRank(Rank.NOTIFICATION)}`)).delete();
    }

    get questionObject() {
        return this.question;
    }

    static async checkIfUserHasQuestionOnDB(user: User) {
        return !!(await DataBase.questionsCollection.findOne({ authorId: user.id, channelId: { $exists: 0 }, deleted: false }) as any);
    }

    async save() {
        if (!this.question._id) {
            await DataBase.questionsCollection.insertOne(this.question);
            return;
        }
        await DataBase.questionsCollection.updateOne({ _id: this.question._id }, { $set: this.question }, { upsert: true });
    }

    async load() {
        this.question = (await DataBase.questionsCollection.findOne({ authorId: this.user.id, channelId: { $exists: 0 }, deleted: false }) as any) || this.question;
    }
}

export default OpenQuestionHandler;