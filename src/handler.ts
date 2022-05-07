import { Client, DMChannel, Guild, GuildMember, User } from "discord.js";
import Config from "./config";
import Components from "./embedsAndComps/components";
import DataBase from "./db";
import Embeds from "./embedsAndComps/Embeds";
import { Question } from "./types";
import { MissingGuildIdError } from "./error";

class Handlers {
    private channel: DMChannel;
    private question: Question;
    constructor(private bot: Client, private user: User, channel: any) {
        this.channel = channel; // TS issues
        this.question = { authorId: this.user.id, deleted: false }
    }

    static async createHandler(bot: Client, user: User, channel: any) {
        const handler = new Handlers(bot, user, channel);
        await handler.load();
        return handler;
    }

    static commonGuilds(bot: Client, user: User) {
        return bot.guilds.cache.filter((g: Guild) => { return !!g.members.cache.find((m: GuildMember) => m.id === user.id); });
    }


    async iHaveAQuestion() {
        await this.channel.send({ embeds: [Embeds.chooseGuild], components: [Components.chooseGuildMenu(this.bot, this.user)] });

    }

    async isReachedLimit() {
        const db = new DataBase();
        const qList = await db.questionsCollection.find({ authorId: this.user.id, guildId: this.question.guildId }).toArray();
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
        const db = new DataBase();
        if (this.question === undefined) return;
        if (!this.question._id) {
            await db.questionsCollection.insertOne(this.question);
        }
        await db.questionsCollection.updateOne({ _id: this.question._id }, { $set: this.question }, { upsert: true });
    }

    async load() {
        const db = new DataBase();
        this.question = (await db.questionsCollection.findOne({ authorId: this.user.id }, { sort: { _id: -1 } }) as any) || this.question;
    }
}

export default Handlers;