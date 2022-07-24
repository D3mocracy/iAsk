import { Client, SelectMenuInteraction, TextChannel } from "discord.js";
import DataBase from "../db";
import Components from "../embedsAndComps/components";
import Embeds from "../embedsAndComps/Embeds";
import { Question, SetupConfig } from "../types";
import LanguageHandler from "./language";

class EditDetailHandler {
    private lang: string = "en";
    private question: Question = {} as any;
    private questionChannel: TextChannel = {} as any;
    private constructor(private bot: Client, private interaction: SelectMenuInteraction) { }

    static async createHandler(bot: Client, interaction: SelectMenuInteraction) {
        const handler = new EditDetailHandler(bot, interaction);
        await handler.load();
        return handler;
    }

    async load() {
        const questionChannelID = `${this.interaction.message.embeds[0].footer?.text.match(/\d+/g)}`;
        this.question = await DataBase.questionsCollection.findOne({ channelId: questionChannelID, deleted: false }) as any;
        this.questionChannel = await this.bot.channels.fetch(this.question.channelId as string) as TextChannel;
        const guildObj: SetupConfig = await DataBase.guildsCollection.findOne({ guildId: this.question.guildId }) as any;
        this.lang = guildObj.language || "en";
    }

    async save() {
        await DataBase.questionsCollection.updateOne({ channelId: this.questionChannel.id }, { $set: this.question }, { upsert: true });
    }

    async askChange() {
        const configMsg = LanguageHandler.getMessageByLang('changeDetailsMessages', this.lang);
        const messages: any = {
            "change-title": configMsg.title,
            "change-description": configMsg.description,
        }
        await this.interaction.channel?.send(messages[this.interaction.values[0]]);
        await this.interaction.update({ components: [Components.changeDetails(this.lang)] });
        this.getDetailData(this.interaction.values[0])
    }

    async sendSureMessage(detailType: string, newDetail: string) {
        if (!this.interaction.channel) return;
        const sureMsg = await this.interaction.channel.send({ embeds: [Embeds.sureChangeDetail(this.lang)], components: [Components.sureChangeDetailButtons(this.lang)] });
        const buttonCollector = this.interaction.channel.createMessageComponentCollector({ componentType: "BUTTON", time: 10 * 1000 });
        buttonCollector.on('collect', async btn => {
            if (btn.customId === 'cng-dtl-sure') {
                const options: any = {
                    "change-title": async () => this.setTitle(newDetail),
                    "change-description": async () => this.setDescription(newDetail),
                }
                await options[detailType]();
                await this.save();
                await btn.update({ components: [] });
                await this.sendNewQuestionMessage();

            } else if (btn.customId === 'cng-dtl-cancel') {
                await sureMsg.edit({ components: [] });
            } else { return; }
        });
        buttonCollector.on('end', async () => {
            await sureMsg.edit({ components: [] });
        })
    }

    async getDetailData(detailType: string) {
        let newDetail: string = '';
        const messageCollector = this.interaction.channel?.createMessageCollector({ max: 1 });
        messageCollector?.on("collect", msg => {
            newDetail = msg.content;
        });

        messageCollector?.on('end', async () => {
            if (detailType === "change-title") {
                await this.sendSureMessage(detailType, newDetail);

            } else if (detailType === "change-description") {
                await this.sendSureMessage(detailType, newDetail);
            }
        })

    }

    async setTitle(newTitle: string) {
        newTitle.length > 100 ? this.question.title = `${newTitle.slice(0, 97)}...` : this.question.title = newTitle;
        if (!this.questionChannel) return;
        await this.questionChannel.setName(this.question.title);
    }
    async setDescription(newDescription: string) {
        this.question.description = newDescription;
    }

    async sendNewQuestionMessage() {
        const user = await this.bot.users.fetch(this.question.authorId) || "Can't Find Member (404)";
        const questionMessage = {
            embeds: [Embeds.questionMessage(this.lang, this.question.title as string, this.question.description as string,
                this.question.anonymous ? LanguageHandler.getMessageByLang('Anonymous', this.lang) : user.tag, this.question.channelId, this.question.guildId)]
        }
        await this.questionChannel.send(questionMessage);
        await this.interaction.channel?.send(questionMessage);
    }

}

export default EditDetailHandler;
