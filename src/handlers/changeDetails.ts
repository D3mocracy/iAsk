import { Client, Guild, TextChannel, User } from "discord.js";
import DataBase from "../db";
import Embeds from "../embedsAndComps/Embeds";
import { ManagementDetails, Question, SetupConfig } from "../types";
import LanguageHandler from "./language";

class ChangeDetailsHandler {
    private question: Question = {} as any;
    private detailManager: ManagementDetails = {} as any;
    private guild: Guild | undefined;
    private channel: TextChannel | undefined;
    private lang: string = "en";
    constructor(private bot: Client, private managerId: string) { }

    static async createHandler(bot: Client, managerId: string) {
        const handler = new ChangeDetailsHandler(bot, managerId);
        try {
            await handler.load();
        } catch (error) {
            return;
        }
        return handler;
    }

    async load() {
        this.detailManager = await DataBase.detailsManagementCollection.findOne({ managerId: this.managerId }) as any;
        this.question = await DataBase.questionsCollection.findOne({ channelId: this.detailManager.channelId, deleted: false }) as any;
        this.guild = this.bot.guilds.cache.get(this.question.guildId as string) as Guild;
        this.channel = this.guild.channels.cache.get(this.question.channelId as string) as TextChannel;
        const guildObj: SetupConfig = await DataBase.guildsCollection.findOne({ guildId: this.question.guildId }) as any;
        this.lang = guildObj.language || "en";
    }

    async save() {
        await DataBase.questionsCollection.updateOne({ channelId: this.detailManager.channelId }, { $set: this.question }, { upsert: true });
        await DataBase.detailsManagementCollection.updateOne({ managerId: this.managerId }, { $set: this.detailManager }, { upsert: true });
    }

    async exit() {
        await DataBase.detailsManagementCollection.deleteOne({ managerId: this.managerId })
    }

    async sendNewQuestionMessage() {
        if (!this.channel || !this.guild) return;
        const member = this.guild.members.cache.get(this.question.authorId);
        if (!member) return;
        await this.channel.send({
            embeds: [Embeds.questionMessage(this.lang, this.question.title as string, this.question.description as string,
                this.question.anonymous ? LanguageHandler.getMessageByLang('Anonymous', this.lang) : member?.user.tag, this.question.channelId, this.question.guildId)]
        })
    }

    async setTitle(newTitle: string) {
        newTitle.length > 100 ? this.question.title = `${newTitle.slice(0, 97)}...` : this.question.title = newTitle;
        if (!this.channel) return;
        await this.channel.setName(this.question.title);
        await this.sendNewQuestionMessage();
    }
    async setDescription(newDescription: string) {
        this.question.description = newDescription;
        await this.sendNewQuestionMessage();
    }

    static async checkIfUserIsManagingDetail(user: User) {
        return await DataBase.detailsManagementCollection.findOne({ managerId: user.id });
    }

    get manageObject() {
        return this.detailManager;
    }
}

export default ChangeDetailsHandler;