import { ButtonInteraction, CategoryChannel, Guild, GuildMember } from "discord.js";
import DataBase from "../db";
import Components from "../embedsAndComps/components";
import Embeds from "../embedsAndComps/Embeds";
import { SupportTicket } from "../types";
import LanguageHandler from "./language";
import RankHandler, { Rank } from "./rank";
import SetupHanlder from "./setup";

class SupportTicketHandler {
    private guild: Guild = {} as Guild;
    private supportTicket: SupportTicket = {} as SupportTicket;

    constructor(private interaction: ButtonInteraction) {
        this.interaction = interaction;
        this.guild = interaction.guild as Guild;
    }

    static async createHandler(interaction: ButtonInteraction) {
        const handler = new SupportTicketHandler(interaction);
        await handler.load();
        return handler;
    }

    async load() {
        this.supportTicket = await DataBase.supportCollection.findOne({ memberId: this.interaction.user.id, guildId: this.interaction.guildId, deleted: false }) as any || {} as SupportTicket;
    }

    async save() {
        await DataBase.supportCollection.updateOne({ channelId: this.supportTicket.channelId }, { $set: this.supportTicket }, { upsert: true });
    }

    async createTicket() {
        const lang = (await DataBase.guildsCollection.findOne({ guildId: this.interaction.guildId }))?.language || "en";
        if (this.supportTicket.memberId) {
            await this.interaction.reply({ content: LanguageHandler.getMessageByLang("alreadyHasTicket", lang), ephemeral: true });
        } else {
            const supportCatagory = this.guild.channels.cache.get((await SetupHanlder.getConfigObject(this.guild.id)).supportCatagory) as CategoryChannel;
            if (supportCatagory) {
                const supportTicketChannel = await supportCatagory.createChannel(`support ${this.interaction.user.username}`, { type: "GUILD_TEXT" });
                const rankHandler = await RankHandler.createHandler(this.interaction.member as GuildMember);
                const ticketNumber = (await DataBase.supportCollection.find({ guildId: this.interaction.guildId }).toArray()).length;

                this.supportTicket = { channelId: supportTicketChannel.id, guildId: this.interaction.guildId as string, deleted: false, memberId: this.interaction.user.id };

                await supportTicketChannel.send({ embeds: [Embeds.supportTicketMainMessage(ticketNumber, this.interaction.member as GuildMember, lang)], components: [await Components.supportTicket(lang)] })
                await (await supportTicketChannel.send(`${rankHandler.getRank(Rank.SUPERVISOR)}`)).delete();
                await (await supportTicketChannel.send(`${this.interaction.user}`)).delete();

                await supportTicketChannel.permissionOverwrites.create(this.interaction.member as GuildMember, { VIEW_CHANNEL: true });

                await this.interaction.deferUpdate();
                await this.save();
            } else {
                await this.interaction.reply({ content: LanguageHandler.getMessageByLang("supportCatagoryError", lang), ephemeral: true });
                return;
            }

        }
    }

    async closeTicket() {
        this.supportTicket.deleted = true;
        await this.interaction.channel?.delete();
    }
}

export default SupportTicketHandler;