import { ButtonInteraction, CategoryChannel, Guild, GuildMember } from "discord.js";
import DataBase from "../db";
import Components from "../embedsAndComps/components";
import Embeds from "../embedsAndComps/Embeds";
import { SupportTicket } from "../types";
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
        this.supportTicket = await DataBase.supportCollection.findOne({ memberId: this.interaction.user.id, deleted: false }) as any || {} as SupportTicket;
    }

    async save() {
        await DataBase.supportCollection.updateOne({ channelId: this.supportTicket.channelId }, { $set: this.supportTicket }, { upsert: true });
    }

    async createTicket() {
        if (this.supportTicket.memberId) {
            await this.interaction.reply({ content: "You already have an open ticket, you have to close it first.", ephemeral: true });
        } else {
            const supportCatagory = await this.guild.channels.fetch((await SetupHanlder.getConfigObject(this.guild.id)).supportCatagory) as CategoryChannel;
            const supportTicketChannel = await supportCatagory.createChannel(`support ${this.interaction.user.username}`, { type: "GUILD_TEXT" });
            this.supportTicket = { channelId: supportTicketChannel.id, guildId: this.interaction.guildId as string, deleted: false, memberId: this.interaction.user.id };
            const ticketNumber = await DataBase.supportCollection.countDocuments({}) + 1;
            await supportTicketChannel.send({ embeds: [Embeds.supportTicketMainMessage(ticketNumber, this.interaction.member as GuildMember)], components: [await Components.supportTicket()] })
            const rankHandler = await RankHandler.createHandler(this.interaction.member as GuildMember);
            await (await supportTicketChannel.send(`${rankHandler.getRank(Rank.SUPERVISOR)}`)).delete();
            await (await supportTicketChannel.send(`${this.interaction.user}`)).delete();
            await supportTicketChannel.permissionOverwrites.create(this.interaction.member as GuildMember, { VIEW_CHANNEL: true });
            await this.interaction.deferUpdate();
        }
    }

    async closeTicket() {
        this.supportTicket.deleted = true;
        await this.interaction.channel?.delete();
    }
}

export default SupportTicketHandler;