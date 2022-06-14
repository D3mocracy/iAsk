import { Client, Guild, TextChannel, User } from "discord.js";
import Embeds from "../embedsAndComps/Embeds";


namespace ErrorHandler {

    export async function sendErrorMessage(bot: Client, error: Error, obj: Guild | User) {
        const guild = bot.guilds.cache.get('956846041091702784');
        const errorChannel = guild?.channels.cache.get('985975927903240212') as TextChannel;
        const embed = Embeds.errorEmbedMessage(error);
        embed.addField(`${obj} ID:`, obj.id, true);
        await errorChannel.send({ embeds: [embed] });
    }
}

export default ErrorHandler;