import { MessageEmbed } from "discord.js";
import Config from "../config";

namespace Embeds {
    export const chooseGuild = new MessageEmbed({
        title: Config.chooseGuildEmbedMessageTitle,
        color: Config.chooseGuildEmbedMessageColor
    });

    export function questionMessage(title: string, description: string, tag: string, channelId?: string) {
        const msg = new MessageEmbed({
            title, description,
            footer: { text: `Channel ID: ${channelId || ""}` }
        }).addFields(
            { name: "Creator Tag: ", value: tag },
        );
        return msg;
    }
}

export default Embeds;