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

    export function questionManageMessage(channelId: string) {
        const msg = new MessageEmbed({
            title: "Management CP",
            description: "Please choose one of the options down below.",
            footer: { text: `${Config.channelIDFooter} ${channelId}` }
        });
        return msg;
    }


    export const worngUsageManageMsg = new MessageEmbed({
        title: "Wrong Usage",
        description: `Use like: ${Config.managePrefix} [${Config.manageMember} / ${Config.manageChannel}] [id]`
    })
}

export default Embeds;