import { Client, GuildMember, TextChannel, User } from "discord.js";
import DataBase from "../db";
import { Question } from "../types";
import { MissingGuildIdError } from "../error"

class ManageQuestionHandler {
    private question: Question = {} as any;
    private questionChannel: TextChannel = {} as any;
    private constructor(private bot: Client, private questionChannelId: string, sender: User) { }

    static async createHandler(bot: Client, questionChannelId: any, sender: User) {
        const handler = new ManageQuestionHandler(bot, questionChannelId, sender);
        await handler.load();
        return handler;
    }

    async save() {
        await DataBase.questionsCollection.updateOne({ channelId: this.questionChannelId }, { $set: this.question }, { upsert: true });
    }

    async load() {
        this.question = (await DataBase.questionsCollection.findOne({ channelId: this.questionChannelId }) as any) || this.question;
        if (!this.question.guildId) throw new MissingGuildIdError();
        this.questionChannel = await (await this.bot.guilds.fetch(this.question.guildId)).channels.fetch(this.questionChannelId) as any;
    }
}

export default ManageQuestionHandler;