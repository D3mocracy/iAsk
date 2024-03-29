import { Client, Guild, GuildMember, MessageEmbed, User } from "discord.js";
import { client } from "..";
import Config from "../config";
import LanguageHandler from "../handlers/language";
import Utils from "../utils";

namespace Embeds {
    const author = { name: "iAsk Bot - D3mocracy#8662", iconURL: "https://i.imgur.com/Yr6z4LR.png", url: 'https://discord.com/users/243380679763558400' };
    const thumbnail = { url: 'https://i.imgur.com/Yr6z4LR.png' };

    export function chooseGuildOpenQuestion(lang: string) {
        const embedDB = LanguageHandler.getMessageByLang("chooseGuildEmbedMessageTitleOpenQuestion", lang);
        const msg = new MessageEmbed({
            author, thumbnail,
            title: embedDB.title,
            description: embedDB.description,
            footer: { text: embedDB.footer },
            color: "YELLOW"
        });
        return msg;
    }

    export const chooseGuildManageMember = new MessageEmbed({
        title: "Choose a guild",
        color: "RANDOM"
    });

    export function supportOpenTicketMessage(lang: string) {
        const supportOpenTicketMessage = LanguageHandler.getMessageByLang("supportOpenTicketMessage", lang);
        return new MessageEmbed({
            thumbnail,
            title: supportOpenTicketMessage.title,
            description: supportOpenTicketMessage.description,
            footer: { text: supportOpenTicketMessage.footer },
            color: 'AQUA'
        });
    }

    export function supportTicketMainMessage(ticketNumber: number, member: GuildMember, lang: string) {
        const supportMsg = LanguageHandler.getMessageByLang("supportTicketMainMessage", lang);
        return new MessageEmbed({
            thumbnail,
            title: `${supportMsg.title} #${ticketNumber}`,
            description: `${supportMsg.creator}: ${member.user.tag} \n ${supportMsg.description}`,
            footer: { text: `${supportMsg.footer}` },
            color: 'AQUA'
        })
    }

    export function sureNo(lang: string) {
        const sureNoDB = LanguageHandler.getMessageByLang('sureNo', lang);
        return new MessageEmbed({
            title: sureNoDB.title,
            description: sureNoDB.description,
            footer: { text: sureNoDB.footer },
            color: "RED"
        })
    }

    export function questionMessage(lang: string, title: string, description: string, tag: string, channelId?: string, guildId?: string) {
        const questionMessageEmbed = LanguageHandler.getMessageByLang('questionMessageEmbed', lang);
        const msg = new MessageEmbed({
            author, title, description, thumbnail,
            footer: { text: `${questionMessageEmbed.channelID} ${channelId || ""}` },
            color: 'AQUA'
        }).addFields(
            { name: `${questionMessageEmbed.creatorTag} `, value: tag, inline: true },
            { name: `${questionMessageEmbed.questionLink} `, value: `[${questionMessageEmbed.clickHere}](https://discord.com/channels/${guildId}/${channelId})`, inline: true },
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
        const embedDB = LanguageHandler.getMessageByLang('questionManageMessage', lang);
        const msg = new MessageEmbed({
            author,
            url,
            title: embedDB.title,
            description: embedDB.description,
            thumbnail: { url: 'https://i.imgur.com/oK6Fu1z.png' },
            footer: { text: `${embedDB.channelID} ${channelId}` },
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
            description, thumbnail,
            author,
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
            title: logToolTitle[toolName],
            footer: { text: `${new Date()}` },
            color: 'RANDOM'
        }).setFields(
            { name: "Done by:", value: managerTag, inline: false },
            { name: "Channel ID:", value: questionId, inline: false },
        )

        return msg;
    }

    export function questionLogMessage(lang: string, channelId: string) {
        const questionLogEmbed = LanguageHandler.getMessageByLang('questionLogEmbed', lang);
        const msg = new MessageEmbed({
            author, thumbnail,
            title: questionLogEmbed.title,
            description: `${questionLogEmbed.footer} ${channelId || "Error 404"}`,
            footer: { text: `${questionLogEmbed.description}` },
            color: 'DARK_ORANGE'
        })

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
            thumbnail,
            title: locked.title,
            description: locked.description,
            color: "RED"
        });

        return lockQuestion;
    }
    export function unlockQuestion(lang: string) {
        const unlocked = LanguageHandler.getMessageByLang('unlockedEmbed', lang);
        const msg = new MessageEmbed({
            thumbnail,
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
            footer: { text: `${changeDetailsEmbed.channelID} ${channelId}` }
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

    export function anonymousMessage(msg: string, isStaff: boolean, lang: string) {
        let anonMsg = LanguageHandler.getMessageByLang(isStaff ? 'anonMessageStaff' : 'anonMessage', lang)
        // const anonMessageStaff = LanguageHandler.getMessageByLang('anonMessageStaff', lang);
        // const anonMessage = LanguageHandler.getMessageByLang('anonMessage', lang);
        return new MessageEmbed({
            title: anonMsg.title,
            description: msg,
            footer: { text: anonMsg.footer },
            color: 'DARK_ORANGE'
        })
    }

    export function sureDeleteQuestion(lang: string) {
        const sureDeleteEmbed = LanguageHandler.getMessageByLang('sureDeleteQuestion', lang);
        return new MessageEmbed({
            title: sureDeleteEmbed.title,
            description: sureDeleteEmbed.description,
            footer: { text: sureDeleteEmbed.footer },
            color: 'RED'
        })
    };

    export function sureChangeDetail(lang: string) {
        const sureDeleteEmbed = LanguageHandler.getMessageByLang('sureChangeDetail', lang);
        return new MessageEmbed({
            title: sureDeleteEmbed.title,
            description: sureDeleteEmbed.description,
            footer: { text: sureDeleteEmbed.footer },
            color: 'DARK_RED'
        })
    };

    export function errorChangeDetail(lang: string) {
        const errorMsg = LanguageHandler.getMessageByLang('errorChangeDetail', lang);
        return new MessageEmbed({
            title: errorMsg.title,
            description: errorMsg.description,
            author, thumbnail,
            color: 'DARK_RED'
        })
    }

    export function haveAQuestionEmbedMessage(lang: string) {
        const msgDB = LanguageHandler.getMessageByLang('haveAQuestion', lang);
        return new MessageEmbed({
            title: msgDB.title,
            description: msgDB.description,
            author, thumbnail,
            color: 'BLURPLE'
        })
    }


}

export default Embeds;