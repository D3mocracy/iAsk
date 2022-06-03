import { Client, Guild, MessageEmbed, User } from "discord.js";
import { client } from "..";
import Config from "../config";
import Utils from "../utils";

namespace Embeds {
    const author = { name: "iAsk Assistant", iconURL: "https://i.imgur.com/I7EoZkF.png" };

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
            footer: { text: `Channel ID: ${channelId || ""}` },
            color: 'AQUA'
        }).addFields(
            { name: "Creator Tag: ", value: tag },
        );
        return msg;
    };

    export function questionManageMember(channelId: string) {
        const msg = new MessageEmbed({
            author,
            title: 'Manage Question',
            description: 'Please choose one of the options below.',
            footer: { text: `${Config.channelIDFooter} ${channelId}` },
            color: 'DARK_BLUE'
        })
        return msg;
    }

    export function questionManageMessage(channelId: string) {
        const msg = new MessageEmbed({
            author,
            title: "Management CP - Channel Edition",
            description: "Please choose one of the options down below.",
            thumbnail: { url: 'https://i.imgur.com/oK6Fu1z.png' },
            footer: { text: `${Config.channelIDFooter} ${channelId}` },
            color: 'LIGHT_GREY'
        });
        return msg;
    }

    export function memberManageMessage(user: User, guildId: string) {
        const member = Utils.convertIDtoMemberFromGuild(client, user.id, guildId);
        const msg = new MessageEmbed({
            author,
            title: "Management CP - Member Edition",
            description: "**Member information:**",
            thumbnail: { url: 'https://i.imgur.com/7Lt7QEE.png' },
            color: 'DARK_GREEN'
        }).addFields([
            { name: "Guild ID:", value: guildId },
            { name: 'Member Tag:', value: user.tag },
            { name: Config.memberIDFooter, value: user.id },
            { name: 'Block Status:', value: member.isCommunicationDisabled() ? "Blocked" : "Not Blocked" },
        ])
        return msg;
    }

    export function blockMemberMessage(memberId: string, guildId: string) {
        const member = Utils.convertIDtoMemberFromGuild(client, memberId, guildId);
        const msg = new MessageEmbed({
            author,
            title: "Block Member",
            description: "Block will disable the member from using the bot and from commenting on the server.",
            thumbnail: { url: 'https://i.imgur.com/6hoKm9h.png' },
            color: 'RED'
        }).addFields([
            { name: "Guild ID:", value: guildId },
            { name: 'Member Tag:', value: member.user.tag },
            { name: Config.memberIDFooter, value: memberId },
            { name: 'Block Ends In:', value: Utils.getRemainTime(member) || 'None' }
        ]);
        return msg;
    }

    export function noteMemberMessage(memberId: string, guildId: string) {
        const member = Utils.convertIDtoMemberFromGuild(client, memberId, guildId);
        const msg = new MessageEmbed({
            author,
            title: "Note System",
            description: "Note system for manager, here you can write notes that won't be available to the user.",
            thumbnail: { url: 'https://i.imgur.com/5WNtvHT.png' },
            color: 'GREY'
        }).addFields([
            { name: "Guild ID:", value: guildId },
            { name: 'Member Tag:', value: member.user.tag },
            { name: Config.memberIDFooter, value: memberId }
        ])
        return msg;
    }

    export function chooseNoteToRemove(memberId: string, guildId: string) {
        const msg = new MessageEmbed({
            title: "Choose A Note To *Remove*",
            color: "RED",
        }).addFields([
            { name: "Guild ID:", value: guildId },
            { name: Config.memberIDFooter, value: memberId }
        ])
        return msg;
    }

    export function managementMessage(guild: Guild, description: string) {
        const msg = new MessageEmbed({
            title: "Management Message",
            description,
            author: { name: "iAsk Management", iconURL: "https://i.imgur.com/I7EoZkF.png" },
            footer: { text: `This message sent from ${guild.name} guild by an administrator.` },
            color: 'DARK_ORANGE'
        })
        return msg;
    };

    export function catagoryHelper(guild: Guild) {
        const msg = new MessageEmbed({
            title: "Catagory Helper",
            description: "Here is some catagories id's",
            color: 'BLURPLE'
        });
        guild.channels.cache.forEach(c => {
            if (c.type === "GUILD_CATEGORY") {
                msg.addField(`${c.name}:`, c.id, false);
            }
        });
        return msg;
    }

    export function channelHelper(guild: Guild) {
        const msg = new MessageEmbed({
            title: "Channel Helper",
            description: "Here is some channels id's",
            color: 'GREEN'
        });
        guild.channels.cache.forEach(c => {
            if (c.type === "GUILD_TEXT") {
                msg.addField(`${c.name}:`, c.id, false);
            }
        });
        return msg;
    }

    export function roleHelper(guild: Guild) {
        const msg = new MessageEmbed({
            title: "Role Helper",
            description: "Here is some roles id's",
            color: 'GREYPLE'
        });
        guild.roles.cache.forEach(c => {
            msg.addField(`${c.name}:`, c.id, false);
        });
        return msg;
    }

    export function manageLogMessage(toolName: string, managerTag: string, questionId: string) {
        const msg = new MessageEmbed({
            title: `${toolName.toUpperCase().replaceAll("-", " ")}`,
            footer: { text: `${new Date()}` },
            color: 'RANDOM'
        }).setFields(
            { name: "Done by:", value: managerTag, inline: false },
            { name: "Channel ID:", value: questionId, inline: false },
        )

        return msg;
    }

    export const notificationMessage = new MessageEmbed({
        title: 'Want to get notified whenever a new question created?',
        description: 'Click on the bell!',
        footer: { text: 'You can click again to remove the role' },
        color: 'DARK_GOLD'
    })

    export const setupMessage = new MessageEmbed({
        title: "Setup Your Guild - iAsk Bot",
        description: "You can see here what properties are already set, or edit them by clicking at the wanted option.",
        footer: { text: "Don't know the id's? you can click on one of the helpers to get some help!" },
        author: { name: "iAsk - Setup Assistant" },
        color: "NAVY"
    });

    export const setupHereMessage = new MessageEmbed({
        title: "Setup Your Channel",
        description: "Type here !setup to start or !setup fast to skip the prolog.",
        color: "GOLD",
        footer: { text: "Bot won't work before the setup will be initialized" }
    })

    export const worngUsageManageMsg = new MessageEmbed({
        title: "Wrong Usage",
        description: `Use like: ${Config.managePrefix} [${Config.manageMember} / ${Config.manageChannel}] [id]`,
        color: 'RED'
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