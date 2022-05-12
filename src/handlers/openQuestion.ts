import { Client, DMChannel, Guild, GuildMember, User } from "discord.js";
import Config from "../config";
import Components from "../embedsAndComps/components";
import DataBase from "../db";
import Embeds from "../embedsAndComps/Embeds";
import { Question } from "../types";
import { MissingGuildIdError } from "../error";

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
        await this.channel.send({ embeds: [Embeds.chooseGuild], components: [Components.chooseGuildMenu(this.bot, this.user)] });
    }

    async isReachedLimit() {
        const qList = await DataBase.questionsCollection.find({ authorId: this.user.id, guildId: this.question.guildId }).toArray();
        return qList.length === Config.maxQuestionsPerGuild + 1;
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
        const guildChannel = await guild.channels.create(this.question.title || "Error 404", { type: "GUILD_TEXT" });
        this.question.channelId = guildChannel.id;
        await guildChannel.send({ embeds: [Embeds.questionMessage(this.question.title || "Error 404", this.question.description || "Error 404", this.question.anonymous ? "Anonymous" : `${this.user.tag}`, this.question.channelId)] });
    }

    get questionObject() {
        return this.question;
    }

    async save() {
        if (!this.question._id) {
            await DataBase.questionsCollection.insertOne(this.question);
            return;
        }
        await DataBase.questionsCollection.updateOne({ _id: this.question._id }, { $set: this.question }, { upsert: true });
    }

    async load() {
        this.question = (await DataBase.questionsCollection.findOne({ authorId: this.user.id, channelId: { $exists: 0 } }) as any) || this.question;
    }
}

export default OpenQuestionHandler;