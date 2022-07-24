import { ButtonInteraction, Client, GuildMember, MessageReaction, User } from "discord.js";
import DataBase from "../db";
import Embeds from "../embedsAndComps/Embeds";
import Utils from "../utils";
import RankHandler, { Rank } from "./rank";

class NotificationHandler {

    private constructor(private bot: Client, private interaction: ButtonInteraction) { }

    static async createHandler(bot: Client, reaction: ButtonInteraction) {
        const handler = new NotificationHandler(bot, reaction);
        return handler;
    }

    async notificationRank() {
        if (!this.interaction.channel || !this.interaction.guildId) return;
        const rankHandler = await RankHandler.createHandler(this.interaction.member as GuildMember);
        rankHandler.hasRank(Rank.NOTIFICATION) ? await rankHandler.removeRank(Rank.NOTIFICATION) : await rankHandler.addRank(Rank.NOTIFICATION);
        this.interaction.deferUpdate();
    }
}

export default NotificationHandler;