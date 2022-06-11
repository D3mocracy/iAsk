import { Client, MessageReaction, User } from "discord.js";
import DataBase from "../db";
import Embeds from "../embedsAndComps/Embeds";
import Utils from "../utils";
import RankHandler, { Rank } from "./rank";

class ReactionHandler {

    private constructor(private bot: Client, private reaction: MessageReaction, private user: User) { }

    static async createHandler(bot: Client, reaction: MessageReaction, user: User) {
        const handler = new ReactionHandler(bot, reaction, user);
        return handler;
    }

    async notificationRank() {
        if (this.reaction.message.channel.type !== 'GUILD_TEXT' || this.user.bot) return;
        const lang = (await DataBase.guildsCollection.findOne({ guildId: this.reaction.message.guildId }))?.language || "en";
        const embedMessage = this.reaction.message.embeds[0];
        if (!embedMessage) return;
        if (embedMessage.title !== Embeds.notificationMessage(lang).title && embedMessage.description !== Embeds.notificationMessage(lang).description) return;
        if (!this.reaction.message.guildId || this.reaction.emoji.name !== '🔔') return;

        const member = Utils.convertIDtoMemberFromGuild(this.bot, this.user.id, this.reaction.message.guildId);
        const rankHandler = await RankHandler.createHandler(member);
        rankHandler.hasRank(Rank.NOTIFICATION) ? await rankHandler.removeRank(Rank.NOTIFICATION) : await rankHandler.addRank(Rank.NOTIFICATION);
        await this.reaction.users.remove(this.user as User);

    }

    async removeReactionsFromAnyBotMessage() {
        if (this.reaction.message.author?.id !== this.bot.user?.id) return;
        this.reaction.users.remove(this.user as User);
    }
}

export default ReactionHandler;