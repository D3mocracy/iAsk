import { MessageEmbed } from "discord.js";
import Config from "../config";

namespace Embeds {
    export const chooseGuildOpenQuestion = new MessageEmbed({
        title: Config.chooseGuildEmbedMessageTitleOpenQuestion,
        color: Config.chooseGuildEmbedMessageColorOpenQuesiton
    });

    export const chooseGuildManageMember = new MessageEmbed({
        title: Config.chooseGuildEmbedMessageTitleOpenQuestion,
        color: Config.chooseGuildEmbedMessageColorOpenQuesiton
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
            title: "Management CP - Channel Edition",
            description: "Please choose one of the options down below.",
            footer: { text: `${Config.channelIDFooter} ${channelId}` }
        });
        return msg;
    }

    export function memberManageMessage(memberId: string) {
        const msg = new MessageEmbed({
            title: "Management CP - Member Edition",
            description: "Please choose one of the options down below.",
            footer: { text: `${Config.memberIDFooter} ${memberId}` }
        });
        return msg;
    }

    export function blockMemberMessage(memberId: string) {
        const msg = new MessageEmbed({
            title: "Block Member",
            description: "Block will disable the member from using the bot and from commenting on the server.",
            footer: { text: `${Config.memberIDFooter} ${memberId}` }
        });
        return msg;
    }

    export function noteMemberMessage(memberId: string) {
        const msg = new MessageEmbed({
            title: "Note System",
            description: "Note system is for managers.",
            footer: { text: `${Config.memberIDFooter} ${memberId}` }
        });
        return msg;
    }


    export const worngUsageManageMsg = new MessageEmbed({
        title: "Wrong Usage",
        description: `Use like: ${Config.managePrefix} [${Config.manageMember} / ${Config.manageChannel}] [id]`
    });

    export const lockQuestion = new MessageEmbed({
        title: "Locked",
        description: "Question is now locked",
        color: "RED"
    });

    export const unlockQuestion = new MessageEmbed({
        title: "Unlocked",
        description: "Question is now unlocked",
        color: "GREEN"
    });

    export function changeDetails(channelId: string) {
        return new MessageEmbed({
            title: "Choose Detail",
            description: "Please choose one of the options below",
            color: "BLURPLE",
            footer: { text: `${Config.channelIDFooter} ${channelId}` }
        });
    }

}

export default Embeds;