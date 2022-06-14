import { Client, Guild, MessageEmbed, User } from "discord.js";
import { client } from "..";
import Config from "../config";
import LanguageHandler from "../handlers/language";
import Utils from "../utils";

namespace Embeds {
    const author = { name: "iAsk Bot - D3mocracy#8662", iconURL: "https://i.imgur.com/I7EoZkF.png", url: 'https://discord.com/users/243380679763558400' };

    export function chooseGuildOpenQuestion(lang: string) {
        const msg = new MessageEmbed({
            title: LanguageHandler.getMessageByLang("chooseGuildEmbedMessageTitleOpenQuestion", lang),
            color: "DARK_VIVID_PINK"
        });
        return msg;
    }

    export const chooseGuildManageMember = new MessageEmbed({
        title: "Choose a guild",
        color: "DARK_VIVID_PINK"
    });

    export function sureNo(lang: string) {
        return new MessageEmbed({
            title: LanguageHandler.getMessageByLang('sureNo', lang).title,
            description: LanguageHandler.getMessageByLang('sureNo', lang).description,
            footer: { text: LanguageHandler.getMessageByLang('sureNo', lang).footer },
            color: "RED"
        })
    }

    export function questionMessage(lang: string, title: string, description: string, tag: string, channelId?: string, guildId?: string) {
        const msg = new MessageEmbed({
            author: { name: LanguageHandler.getMessageByLang('jumpToQuestion', lang), iconURL: 'https://i.imgur.com/I7EoZkF.png', url: `https://discord.com/channels/${guildId}/${channelId}` },
            title, description,
            footer: { text: `${LanguageHandler.getMessageByLang("channelIDString", lang)} ${channelId || ""}` },
            color: 'AQUA'
        }).addFields(
            { name: `${LanguageHandler.getMessageByLang('creatorTag', lang)} `, value: tag },
        );
        return msg;
    };

    export function questionManageMember(lang: string, channelId: string) {
        const obj = LanguageHandler.getMessageByLang('memberManageQuestionEmbed', lang)
        const msg = new MessageEmbed({
            author,
            title: obj.title,
            description: obj.description,
            footer: { text: `${obj.channelId} ${channelId}` },
            color: 'DARK_BLUE'
        })
        return msg;
    }

    export function questionManageMessage(lang: string, channelId: string, url: string) {
        const msg = new MessageEmbed({
            author,
            url,
            title: LanguageHandler.getMessageByLang('questionManageMessage', lang).title,
            description: LanguageHandler.getMessageByLang('questionManageMessage', lang).description,
            thumbnail: { url: 'https://i.imgur.com/oK6Fu1z.png' },
            footer: { text: `${LanguageHandler.getMessageByLang('channelIDString', lang)} ${channelId}` },
            color: 'LIGHT_GREY',
        });
        return msg;
    }

    export function memberManageMessage(lang: string, user: User, guildId: string) {
        const memberManageEmbed = LanguageHandler.getMessageByLang('memberManageEmbed', lang);
        const member = Utils.convertIDtoMemberFromGuild(client, user.id, guildId);
        const msg = new MessageEmbed({
            author,
            title: memberManageEmbed.title,
            description: memberManageEmbed.description,
            thumbnail: { url: 'https://i.imgur.com/7Lt7QEE.png' },
            color: 'DARK_GREEN'
        }).addFields([
            { name: memberManageEmbed.guildId, value: guildId },
            { name: memberManageEmbed.memberTag, value: user.tag },
            { name: memberManageEmbed.memberId, value: user.id },
            { name: memberManageEmbed.blockStatus, value: member.isCommunicationDisabled() ? memberManageEmbed.blocked : memberManageEmbed.notBlocked },
        ])
        return msg;
    }

    export function blockMemberMessage(lang: string, memberId: string, guildId: string) {
        const blockMemberMessageEmbed = LanguageHandler.getMessageByLang('blockMemberMessageEmbed', lang);
        const member = Utils.convertIDtoMemberFromGuild(client, memberId, guildId);
        const msg = new MessageEmbed({
            author,
            title: blockMemberMessageEmbed.title,
            description: blockMemberMessageEmbed.description,
            thumbnail: { url: 'https://i.imgur.com/6hoKm9h.png' },
            color: 'RED'
        }).addFields([
            { name: blockMemberMessageEmbed.guildId, value: guildId },
            { name: blockMemberMessageEmbed.memberTag, value: member.user.tag },
            { name: blockMemberMessageEmbed.memberId, value: memberId },
            { name: blockMemberMessageEmbed.blockEndsIn, value: Utils.getRemainTime(member) || blockMemberMessageEmbed.none }
        ]);
        return msg;
    }

    export function noteMemberMessage(lang: string, memberId: string, guildId: string) {
        const noteConfig = LanguageHandler.getMessageByLang('noteMemberMessageEmbed', lang);
        const member = Utils.convertIDtoMemberFromGuild(client, memberId, guildId);
        const msg = new MessageEmbed({
            author,
            title: noteConfig.title,
            description: noteConfig.description,
            thumbnail: { url: 'https://i.imgur.com/5WNtvHT.png' },
            footer: { text: `${noteConfig.guildId} ${guildId}` },
            color: 'GREY'
        }).addFields([
            { name: noteConfig.memberTag, value: member.user.tag },
            { name: noteConfig.memberId, value: memberId }
        ])
        return msg;
    }

    export function chooseNoteToRemove(lang: string, memberId: string, guildId: string) {
        const removeNote = LanguageHandler.getMessageByLang('removeNoteEmbed', lang);
        const msg = new MessageEmbed({
            title: removeNote.title,
            color: "RED",
        }).addFields([
            { name: removeNote.guildId, value: guildId },
            { name: removeNote.memberId, value: memberId }
        ])
        return msg;
    }

    export function managementMessage(lang: string, guild: Guild, description: string) {
        const obj = LanguageHandler.getMessageByLang('managementMessageEmbed', lang);
        const msg = new MessageEmbed({
            title: obj.title,
            description,
            author: { name: obj.author, iconURL: "https://i.imgur.com/I7EoZkF.png" },
            footer: { text: `${obj.footer} ${guild.name}.` },
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

    export function manageLogMessage(toolName: string, managerTag: string, questionId: string, lang: string) {
        const logToolTitle = LanguageHandler.getMessageByLang('logToolTitle', lang);

        const msg = new MessageEmbed({
            title: logToolTitle[toolName], //`${toolName.toUpperCase().replaceAll("-", " ")}`
            footer: { text: `${new Date()}` },
            color: 'RANDOM'
        }).setFields(
            { name: "Done by:", value: managerTag, inline: false },
            { name: "Channel ID:", value: questionId, inline: false },
        )

        return msg;
    }
    export function notificationMessage(lang: string) {
        const notifEmbed = LanguageHandler.getMessageByLang('notificationEmbed', lang);
        const notificationMessage = new MessageEmbed({
            title: notifEmbed.title,
            description: notifEmbed.description,
            footer: { text: notifEmbed.footer },
            color: 'DARK_GOLD'
        })
        return notificationMessage;
    }

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

    export function lockedEmbedMessage(lang: string) {
        const locked = LanguageHandler.getMessageByLang('lockedEmbed', lang);
        const lockQuestion = new MessageEmbed({
            title: locked.title,
            description: locked.description,
            color: "RED"
        });

        return lockQuestion;
    }
    export function unlockQuestion(lang: string) {
        const unlocked = LanguageHandler.getMessageByLang('unlockedEmbed', lang);
        const msg = new MessageEmbed({
            title: unlocked.title,
            description: unlocked.description,
            color: "GREEN"
        });
        return msg;
    }

    export function changeDetails(lang: string, channelId: string) {
        const changeDetailsEmbed = LanguageHandler.getMessageByLang('changeDetailsEmbed', lang);
        return new MessageEmbed({
            title: changeDetailsEmbed.title,
            description: changeDetailsEmbed.description,
            color: "BLURPLE",
            footer: { text: `${LanguageHandler.getMessageByLang('channelIDString', lang)} ${channelId}` }
        });
    }

    export function errorEmbedMessage(error: Error) {
        return new MessageEmbed({
            title: error.name,
            description: error.message,
            color: "DARK_RED",
            footer: { text: `iAsk Developer Tools` }
        });
    }



}

export default Embeds;