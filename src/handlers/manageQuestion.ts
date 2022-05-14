import { Client, DMChannel, GuildMember, Role, TextChannel, User } from "discord.js";
import DataBase from "../db";
import { ManagementDetails, Question } from "../types";
import { MissingGuildIdError, UnknownChannel } from "../error"
import Config from "../config";
import Embeds from "../embedsAndComps/Embeds";
import Components from "../embedsAndComps/components";
import { createTranscript } from "discord-html-transcripts";

class ManageQuestionHandler {
    private question: Question = {} as any;
    private questionChannel: TextChannel = {} as any;
    private dmChannel: DMChannel;
    private manageDetail: ManagementDetails = {} as any;
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

    get questionObject() {
        return this.question;
    }

    async deleteQuestion() {
        if (!this.question.deleted) {
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
        const attachment = await createTranscript(this.questionChannel, {
            limit: -1,
            returnType: "attachment",
            fileName: `question_log.html`
        });
        await this.dmChannel.send({ files: [attachment] });
    }

    async chooseChangeDetail() {
        await this.dmChannel.send({ embeds: [Embeds.changeDetails(this.questionChannelId)], components: [Components.changeDetails()] })
    }

    async changeDetail(detail: string) {
        const messages: any = {
            "change-title": "Please type a new title",
            "change-description": "Please type a new description",
        }
        await DataBase.managementCollection.updateOne({ managerId: this.sender.id }, { $set: { status: detail, channelId: this.questionChannelId } }, { upsert: true });
        this.dmChannel.send(messages[detail]);

    }

    async switchAnonymous() {
        this.question.anonymous = !this.question.anonymous;
    }

}

export default ManageQuestionHandler;