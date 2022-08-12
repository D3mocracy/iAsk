import { ButtonInteraction, CategoryChannelResolvable, Client, DMChannel, Guild, GuildMember, Message, MessageEmbed, MessageOptions, SelectMenuInteraction, User, Util } from "discord.js";
import Config from "../config";
import Components from "../embedsAndComps/components";
import DataBase from "../db";
import Embeds from "../embedsAndComps/Embeds";
import { Question } from "../types";
import { MissingGuildIdError } from "../error";
import SetupHanlder from "./setup";
import RankHandler, { Rank } from "./rank";
import Utils from "../utils";
import LanguageHandler from "./language";

class OpenQuestionHandler {
    private channel: DMChannel;
    private question: Question;

    private constructor(private bot: Client, private user: User, channel: any, private lang: string) {
        this.channel = channel; // TS issues
        this.question = { authorId: this.user.id, deleted: false, lang: "en" }
    }

    static async createHandler(bot: Client, user: User, channel: any, lang: string = "en") {
        const handler = new OpenQuestionHandler(bot, user, channel, lang);
        await handler.load();
        return handler;
    }

    async getDefaultQuestionMessage() {
        const anonymousLang = LanguageHandler.getMessageByLang('Anonymous', this.question.lang);
        return [Embeds.questionMessage(this.question.lang, this.question.title || "Default Title", this.question.description || 'Default Description', this.question.anonymous ? `${anonymousLang}` : `${this.user.tag}`, this.question.channelId, this.question.guildId)];
    }

    private getMessageFromLangHandler(key: string) {
        return LanguageHandler.getMessageByLang(key, this.question.lang);
    }

    async iHaveAQuestion(guild?: Guild) {
        this.question.started = true;
        this.question.lock = false;
        this.question.lang = this.lang;
        if (guild) {
            await this.chooseGuild(guild);
        } else {
            await this.channel.send({ embeds: [Embeds.chooseGuildOpenQuestion(this.lang)], components: [await Components.chooseGuildMenuOpenQuestion(this.bot, this.user, this.lang)] })
        }

    }

    async chooseBeforeContinue() {
        await this.channel.send({ content: Config.pleaseChooseGuildBeforeContinue, embeds: [Embeds.chooseGuildOpenQuestion(this.question.lang)], components: [await Components.chooseGuildMenuOpenQuestion(this.bot, this.user, this.question.lang)] });
    }

    async isReachedLimit() {
        const qList = await DataBase.questionsCollection.find({ authorId: this.user.id, guildId: this.question.guildId, deleted: false }).toArray();
        if (qList.length >= (await SetupHanlder.getConfigObject(this.question.guildId as string)).maxQuestions) {
            this.question.deleted = true;
            await this.channel.send({ content: this.getMessageFromLangHandler('reachLimitQuestionsError'), components: [], embeds: [] });
            return true;
        } else return false;
    }

    async chooseGuild(guild: Guild) {
        // this.question.guildId = interaction.values[0];
        this.question.guildId = guild.id;
        const member = Utils.convertIDtoMemberFromGuild(this.bot, this.user.id, this.question.guildId);
        if (await this.isReachedLimit()) return;

        if (member.isCommunicationDisabled()) {
            await this.channel.send(this.getMessageFromLangHandler('blockedFromThisGuild'));
            this.question.deleted = true;
            return;

        } else {
            // const guildName = (await this.bot.guilds.fetch((interaction as SelectMenuInteraction).values[0])).name;
            const guildName = guild.name;
            const yourChoiceIs = this.getMessageFromLangHandler('yourChoiceIs');
            await this.channel.send({ content: `${yourChoiceIs} ${guildName}`, embeds: [], components: [] });
            await this.channel.send(this.getMessageFromLangHandler("chooseTitleMessage"));
        }
    }

    async sureNo(interaction: ButtonInteraction) {
        await interaction.update({ components: [] });
        await this.channel.send({ embeds: [Embeds.sureNo(this.question.lang)], components: [Components.editButtons(this.question.lang)] });
    }

    async chooseTitle(title: string) {
        title.length > 100 ? this.question.title = `${title.slice(0, 97)}...` : this.question.title = title;
        if (this.question.description) return;
        await this.channel.send({ embeds: await this.getDefaultQuestionMessage() });
        await this.channel.send({ content: this.getMessageFromLangHandler('chooseDescriptionMessage') });
    }

    async chooseDescription(description: string) {
        this.question.description = description;
        if (this.question.anonymous !== undefined) return;
        await this.channel.send({ embeds: await this.getDefaultQuestionMessage() });
        await this.channel.send({ content: this.getMessageFromLangHandler("chooseAnonymousMessage"), components: [Components.chooseToBeAnonymousButtons(this.question.lang)] })

    }

    async sendSureMessage() {
        await this.channel.send({ embeds: (await this.getDefaultQuestionMessage()), });
        await this.channel.send({
            content: this.getMessageFromLangHandler('askSureMessage'),
            components: [Components.chooseSureMessage(this.question.lang)]
        })
    }

    async chooseAnonymous(anonymous: boolean, interaction: ButtonInteraction) {
        this.question.anonymous = anonymous;
        await interaction.update({ embeds: [], components: [] })
        await this.sendSureMessage();
    }

    async deleteQuestion(interaction: ButtonInteraction) {
        const cancelQuestionMessage = LanguageHandler.getMessageByLang('cancelQuestionMessage', this.question.lang)
        this.question.deleted = true;
        await interaction.update({ content: cancelQuestionMessage, embeds: [], components: [] });
    }

    async createChannelOnGuild(interaction: ButtonInteraction) {
        if (!this.question.guildId) throw new MissingGuildIdError();
        const guild = await this.bot.guilds.fetch(this.question.guildId);
        const setUp = (await SetupHanlder.getConfigObject(guild.id));
        const questionCatagory = await this.bot.channels.fetch((await SetupHanlder.getConfigObject(this.question.guildId)).questionCatagory) as CategoryChannelResolvable;
        const guildChannel = await guild.channels.create(this.question.title || "Error 404", { type: "GUILD_TEXT", parent: questionCatagory });
        if (interaction) await interaction.update({ embeds: [], components: [] });
        await guildChannel.setRateLimitPerUser(setUp.slowModeSecond);
        this.question.channelId = guildChannel.id;
        await this.channel.send({ embeds: await this.getDefaultQuestionMessage() });
        await guildChannel.send({ embeds: await this.getDefaultQuestionMessage() });
        await this.channel.send(this.getMessageFromLangHandler('succsesMsg'));
        const rankHandler = await RankHandler.createHandler(Utils.convertIDtoMemberFromGuild(this.bot, this.user.id, guild.id));
        await (await guildChannel.send(`${rankHandler.getRank(Rank.NOTIFICATION)}`)).delete();

    }

    get questionObject() {
        return this.question;
    }

    async createMessageCollector(interaction: ButtonInteraction, detail: string) {
        const filter = (m: Message) => m.author.id === interaction.user.id;
        const messageCollector = this.channel.createMessageCollector({ filter, max: 1 });
        await interaction.update({ content: `Please type a new ${detail}`, components: [], embeds: [] });
        messageCollector.on('collect', async msg => {
            if (detail === "title") {
                await this.chooseTitle(msg.content);
            } else if (detail === "description") {
                await this.chooseDescription(msg.content);
            }
        });

        messageCollector.on('end', async collected => {
            if (collected.size === 1) {
                await this.save();
                await this.sendSureMessage();
            }
        });
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