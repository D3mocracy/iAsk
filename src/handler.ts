import { Client, DMChannel, Guild, GuildMember, Message, SelectMenuInteraction, User } from "discord.js";
import Config from "./config";
import Components from "./embedsAndComps/components";
import DataBase from "./db";
import Embeds from "./embedsAndComps/Embeds";
import { Question } from "./types";

class Handlers {
    private channel: DMChannel;
    private question: any;
    constructor(private bot: Client, private user: User, channel: any) {
        this.channel = channel; // TS issues
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
        this.question = { authorId: this.user.id, done: false };
        await this.channel.send({ embeds: [Embeds.chooseGuild], components: [Components.chooseGuildMenu(this.bot, this.user)] });

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
            embeds: [Embeds.questionMessage(this.question.title, this.question.description, this.question.anonymous ? "Anonymous" : `${this.user.tag}`)],
            components: [Components.chooseSureMessage()]
        });
    }

    async chooseDone(done: boolean) {
        this.question.done = done;
        await this.channel.send(Config.succsesMsg);
    }

    async deleteQuestion() {
        const db = new DataBase();
        await db.questionsCollection.deleteOne({ guildId: this.question.guildId, authorId: this.question.authorId });
    }

    async createChannelOnGuild() {
        const guild = await this.bot.guilds.fetch(this.question.guildId);
        const guildChannel = await guild.channels.create(this.question.title, { type: "GUILD_TEXT" });
        this.question.channelId = guildChannel.id;
        await guildChannel.send({ embeds: [Embeds.questionMessage(this.question.title, this.question.description, this.question.anonymous ? "Anonymous" : `${this.user.tag}`, this.question.channelId)] });
    }

    get questionObject() {
        return this.question;
    }

    async save() {
        const db = new DataBase();
        if (this.question === undefined) return;
        await db.questionsCollection.updateOne({ authorId: this.question.authorId }, { $set: this.question }, { upsert: true });
    }

    async load() {
        const db = new DataBase();
        this.question = await db.questionsCollection.findOne({ authorId: this.user.id })
    }
}

export default Handlers;