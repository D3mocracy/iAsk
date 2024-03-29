require("dotenv").config();
import { ButtonInteraction, Client, DMChannel, Guild, Intents, Message, MessageActionRow, MessageReaction, SelectMenuInteraction, TextChannel, User } from "discord.js";
import Config from "./config";
import DataBase from "./db";
import Embeds from "./embedsAndComps/Embeds";
import ManageMemberHanlder from "./handlers/manageMember";
import NewNoteHandler from "./handlers/newNote";
import ManageQuestionHandler from "./handlers/manageQuestion";
import OpenQuestionHandler from "./handlers/openQuestion";
import Utils from "./utils";
import NoteManageHanlder from "./handlers/noteManage";
import ManagementMessageHanlder from "./handlers/managementMessage";
import SetupHanlder from "./handlers/setup";
import RankHandler, { Rank } from "./handlers/rank";
import { Question, SetupConfig, SupportTicket } from "./types";
import { init as dbConfigInit } from "./jobs/dbConfig";
import { languageInit } from "./jobs/dbLanguage";
import LanguageHandler from "./handlers/language";
import NotificationHandler from "./handlers/reactionHandler";
import ErrorHandler from "./handlers/error";
import { MongoClient } from "mongodb";
import Components from "./embedsAndComps/components";
import SupportTicketHandler from "./handlers/support";
export const client: Client = new Client({ partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "USER"], intents: new Intents(32767) });


client.on("ready", async () => {
    // await asyncDataBase();
    console.log("iAsk is online! :D");
})

async function asyncDataBase() {
    const realBot: MongoClient = new MongoClient("mongodb+srv://iask:A123b123%21%40@cluster0.usv4u.mongodb.net/test");
    await realBot.connect();
    const langCollection = realBot.db('iAskBot').collection('Language');
    DataBase.languageCollection.find().forEach(x => {
        langCollection.updateOne({ key: x.key }, { $set: x }, { upsert: true });
    })
}

client.on("messageCreate", async message => {
    try {
        if (message.attachments.size > 0) return;
        if (message.channel.type === "DM" && message.author != client.user) {
            const args = message.content.split(" ");
            if ((await Utils.commonGuildCheck(client, message.author)).length === 0) {
                await message.channel.send(Config.error404);
                return;
            }

            if (await NewNoteHandler.isAddingNote(message.author.id)) {
                const managerNoteHandler = await NewNoteHandler.createHandler(message.author);
                managerNoteHandler.setNoteContent(message);
                await managerNoteHandler.save();
                return;
            }

            if (await ManagementMessageHanlder.isWritingManageMessage(message.author.id)) {
                const managementMessageHandler = await ManagementMessageHanlder.createHandler(message.author, client);
                await managementMessageHandler.setContent(message.content, message.channel as DMChannel);
                await managementMessageHandler.save();
                return;
            }

            if (args[0].toLowerCase() === "!question") {
                if (args.length < 2) return;
                const manageQuestionHandler = await ManageQuestionHandler.createHandler(client, args[1], message.channel, message.author);
                if (!manageQuestionHandler) return;
                if (!(await manageQuestionHandler.checkQuestionBelongToMember())) return;
                const guild = await client.guilds.fetch(manageQuestionHandler.questionObject.guildId as string)
                const channel = await guild.channels.fetch(manageQuestionHandler.questionObject.channelId as string);
                if (!channel) return;
                await manageQuestionHandler.sendMemberQuestionManageMessage();
                return;
            }

            if (args[0].toLowerCase() === Config.managePrefix) {
                if (args.length === 3) {
                    if (args[1] === Config.manageChannel) {
                        const manageQuestionHandler = await ManageQuestionHandler.createHandler(client, args[2], message.channel as DMChannel, message.author);
                        if (!manageQuestionHandler) return;
                        if (await manageQuestionHandler.isStaff()) {
                            await manageQuestionHandler.sendManageQuestionMessage(message);
                        } else {
                            await message.reply("Sorry, you are not a staff member on that guild.");
                            return;
                        }


                    } else if (args[1] === Config.manageMember) {
                        const user = client.users.cache.get(args[2]);
                        if (!user) {
                            await message.reply("Error 404: Member Not Found")
                            return;
                        }
                        const handler = await ManageMemberHanlder.createHandler(client, message.author, user);
                        handler.createNewAction(message.channel as any);
                        handler.save();
                    } else {
                        await message.channel.send({ embeds: [Embeds.worngUsageManageMsg] });
                    }
                    return;
                } else {
                    await message.channel.send({ embeds: [Embeds.worngUsageManageMsg] });
                    return;
                }
            }
            const lang = LanguageHandler.messageLanaguageChecker(Config.iHaveAQuestionMessage, message.content);
            const openQuesitonHandler = await OpenQuestionHandler.createHandler(client, message.author, message.channel, lang);

            if (!openQuesitonHandler.questionObject.started && lang) {
                await openQuesitonHandler.iHaveAQuestion();
                await openQuesitonHandler.save();
                return;
            }

            if (await OpenQuestionHandler.checkIfUserHasQuestionOnDB(message.author)) {
                if (!openQuesitonHandler.questionObject.guildId) {
                    await openQuesitonHandler.chooseBeforeContinue();

                } else if (!openQuesitonHandler.questionObject.title) {
                    await openQuesitonHandler.chooseTitle(message.content);

                } else if (!openQuesitonHandler.questionObject.description) {
                    await openQuesitonHandler.chooseDescription(message.content);
                }
                await openQuesitonHandler.save();
                return;
            }
        } else if (message.channel.type === "GUILD_TEXT" && message.author !== client.user) {
            if (message.guildId === "884988115364749363" && message.channelId === "885011183772512256") {
                message.react('🤍');
            }
            const lang = (await DataBase.guildsCollection.findOne({ guildId: message.guildId }))?.language || "en";
            if (message.content === "!ask" && message.member?.permissions.has('ADMINISTRATOR')) {
                await message.channel.send({ embeds: [Embeds.haveAQuestionEmbedMessage(lang)], components: [Components.haveAQuestionButton(lang)] });
                await message.delete();
            }
            if (message.content === "!notif" && message.member?.permissions.has('ADMINISTRATOR')) {
                await message.channel.send({ embeds: [Embeds.notificationMessage(lang)], components: [Components.notificationButton()] });
                await message.delete();
            }
            if (message.content === "!support" && message.member?.permissions.has('ADMINISTRATOR')) {
                await message.channel.send({ embeds: [Embeds.supportOpenTicketMessage(lang)], components: [Components.supportOpenTicketButton(lang)] });
                await message.delete();
            }
            const args = message.content.split(" ");
            if (args[0] === "!setup" && message.member?.permissions.has('ADMINISTRATOR')) {
                if (!message.guildId) return;
                const setupHandler = await SetupHanlder.createHandler(client, message.channel as TextChannel);
                await setupHandler.sendProlog(args[1]);

                const buttonCollector = message.channel.createMessageComponentCollector({ componentType: 'BUTTON' });
                buttonCollector.on('collect', async btn => {
                    if (!btn.guild) return;
                    if (btn.customId === "hlp-catagory" || btn.customId === "hlp-channel" || btn.customId === "hlp-role") {
                        await setupHandler.sendHelpers(message, btn);
                    } else return;

                    try {
                        await btn.deferUpdate();
                    } catch (error) { }
                })

                const interactionCollector = message.channel.createMessageComponentCollector({ componentType: 'SELECT_MENU' });
                interactionCollector.on('collect', async i => {
                    if (!i.channel) return;

                    try {
                        await i.update({ content: `**Please type the new ${i.values[0].replaceAll("-", " ")}**`, embeds: [], components: [] });
                    } catch (error) { }

                    const messageCollector = i.channel.createMessageCollector({ max: 1 });
                    messageCollector.on('collect', async m => {
                        if (m.author.bot) return;
                        await setupHandler.setConfigValue(i.values[0], m.content);
                        await setupHandler.save();
                        await m.channel.sendTyping();
                        await setupHandler.sendSetupMessage();
                    });
                })
            }
        }
    } catch (error) {
        console.error(error);
        await ErrorHandler.sendErrorMessage(client, error as Error, message.member?.user || client.user as User);
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isSelectMenu()) {
            if (interaction.customId === "choose-guild-open-question") {
                const openQuestionHandler = await OpenQuestionHandler.createHandler(client, interaction.user, interaction.channel);
                const guild: Guild = await client.guilds.fetch(interaction.values[0]);
                await openQuestionHandler.chooseGuild(guild);
                await interaction.deferUpdate();
                await openQuestionHandler.save();

            } else if (interaction.customId === "choose-guild-manage-member") {
                const memberId = await ManageMemberHanlder.getMemberIdFromDBByManagerId(interaction.user);
                const target: User = Utils.convertIDtoUser(client, memberId) as User;
                const manageMemberHanlder = await ManageMemberHanlder.createHandler(client, interaction.user, target);
                if (target.bot) {
                    interaction.update({ content: `Maybe I will try to !manage human ${interaction.user.username} how would that feel?`, embeds: [], components: [] });
                    return;
                }

                await manageMemberHanlder.chooseGuild(interaction);
                await manageMemberHanlder.save();


            } else if (interaction.customId === "channel-mng") {
                const footer: string = (interaction as SelectMenuInteraction).message.embeds[0].footer?.text as string;
                const managedChannelId: string = `${footer.match(/\d+/g)}`;
                const manageQuestionHandler = await ManageQuestionHandler.createHandler(client, managedChannelId, interaction.channel, interaction.user);
                if (!manageQuestionHandler) return;
                const options: any = {
                    "question-anon-msg": async () => manageQuestionHandler.sendAnonMessage(),
                    "question-del": async () => manageQuestionHandler.sendSureDeleteQuestionMessage(),
                    "question-lock": async () => manageQuestionHandler.lockQuestion(),
                    "question-unlock": async () => manageQuestionHandler.unlockQuestion(),
                    "question-reveal": async () => manageQuestionHandler.revealUserTag(),
                    "question-log": async () => manageQuestionHandler.logQuestion(),
                    "question-details-change": async () => manageQuestionHandler.chooseChangeDetail(),
                }
                await manageQuestionHandler.log(interaction.values[0]);
                await options[interaction.values[0]]();
                await manageQuestionHandler.save();
                await manageQuestionHandler.updateEmbedAndCompManager(interaction);

            } else if (interaction.customId === "change-dtl") {
                const footer: string = (interaction as SelectMenuInteraction).message.embeds[0].footer?.text as string;
                const managedChannelId: string = `${footer.match(/\d+/g)}`;
                const manageQuestionHandler = await ManageQuestionHandler.createHandler(client, managedChannelId, interaction.channel, interaction.user);
                if (!manageQuestionHandler) return;
                await manageQuestionHandler.changeDetail(interaction);
                await manageQuestionHandler.save();


            } else if (interaction.customId === "mbr-mng") {
                const memberId = await ManageMemberHanlder.getMemberIdFromDBByManagerId(interaction.user);
                const manageMemberHanlder = await ManageMemberHanlder.createHandler(client, interaction.user, memberId);

                const options: any = {
                    "mbr-note": async () => manageMemberHanlder.updateToNoteMenu(interaction),
                    "mbr-management-msg": async () => manageMemberHanlder.insertDetailsToManagementMessageHandler(interaction),
                }

                await options[interaction.values[0]]();
                await manageMemberHanlder.save();

            } else if (interaction.customId === "note-mbr") {
                const noteManageHanlder = await NoteManageHanlder.createHanlder(interaction);

                const options: any = {
                    "note-add": async () => {
                        const footer: string = (interaction as SelectMenuInteraction).message.embeds[0].footer?.text as string;
                        const guildId: string = `${footer.match(/\d+/g)}`;
                        const newNoteHandler = await NewNoteHandler.createHandler(interaction.user, interaction);
                        await newNoteHandler.addNote()
                        await newNoteHandler.save();
                    },
                    "note-remove": async () => { noteManageHanlder.updateToRemoveNotesMessage() },
                    "note-reset": async () => { noteManageHanlder.softDeleteAllNotes() },
                    "note-show": async () => { noteManageHanlder.sendShowAllNotesMessage() }
                }
                await options[interaction.values[0]]();

            } else if (interaction.customId === "remove-notes") {
                const noteManageHanlder = await NoteManageHanlder.createHanlder(interaction);
                noteManageHanlder.removeNote();

            }


        } else if (interaction.isButton() && interaction.channel?.type === "DM") {
            if (interaction.customId === "del-sure" || interaction.customId === 'del-cancel') return;
            if (interaction.customId === "cng-dtl-sure" || interaction.customId === 'cng-dtl-cancel') return;

            if (interaction.customId === "mng-msg-yes" || interaction.customId === "mng-msg-no") {
                const managementMessageHandler = await ManagementMessageHanlder.createHandler(interaction.user, client);
                await managementMessageHandler.manageMessageDealer(interaction);

                await managementMessageHandler.save();
                return;
            }
            const openQuestionHandler = await OpenQuestionHandler.createHandler(client, interaction.user, interaction.channel);
            if (!openQuestionHandler) return;
            const args = interaction.customId.split("-");
            if (args[0] === 'edit') {
                await openQuestionHandler.createMessageCollector(interaction, args[1]);
                await openQuestionHandler.save();
                return;
            }
            if ((interaction.customId === "anon-yes" || interaction.customId === "anon-no") && openQuestionHandler.questionObject.anonymous === undefined) {
                await openQuestionHandler.chooseAnonymous(interaction.customId === "anon-yes", interaction);
            } else if (!openQuestionHandler.questionObject.channelId) {
                if (interaction.customId === "sure-yes") {
                    await openQuestionHandler.createChannelOnGuild(interaction);
                } else if (interaction.customId === "sure-no") {
                    await openQuestionHandler.sureNo(interaction);
                } else if (interaction.customId === 'cancel') {
                    await openQuestionHandler.deleteQuestion(interaction);
                    await openQuestionHandler.save();
                    return;
                }
            }
            await openQuestionHandler.save();
        } else if (interaction.isButton() && interaction.channel?.type === "GUILD_TEXT") {
            if (interaction.customId === "open-ticket-support") {
                const supportHandler = await SupportTicketHandler.createHandler(interaction);
                await supportHandler.createTicket();
                return;
            } else if (interaction.customId === 'close-ticket') {
                const supportHandler = await SupportTicketHandler.createHandler(interaction);
                await supportHandler.closeTicket();
                await supportHandler.save();
            } else if (interaction.customId === "notif-btn") {
                const notificationHandler = await NotificationHandler.createHandler(client, interaction as ButtonInteraction);
                await notificationHandler.notificationRank();
            } else if (interaction.customId === "havequestion-btn") {
                const lang = (await DataBase.guildsCollection.findOne({ guildId: interaction.guildId }))?.language || "en";
                const DMChannel = await interaction.user.createDM();
                const openQuestionHandler = await OpenQuestionHandler.createHandler(client, interaction.user, DMChannel as DMChannel, lang);
                await openQuestionHandler.iHaveAQuestion(interaction.guild as Guild);
                await openQuestionHandler.save();
                await interaction.deferUpdate();
            }
        }
    } catch (error) {
        console.error(error);
        await ErrorHandler.sendErrorMessage(client, error as Error, interaction.user);

    }
});

client.on('channelDelete', async c => {
    try {
        if (!c.isText()) return;
        const channel = (c as TextChannel);
        const config: SetupConfig = await DataBase.guildsCollection.findOne({ guildId: channel.guildId }) as any;
        if (!config) return;
        const questionCatagory = await channel.guild.channels.fetch(config.questionCatagory);
        const supportCatagory = await channel.guild.channels.fetch(config.supportCatagory);

        switch (channel.parent) {
            case questionCatagory:
                await DataBase.questionsCollection.updateOne({ guildId: channel.guildId, channelId: channel.id }, { $set: { deleted: true } });
                break;

            case supportCatagory:
                await DataBase.supportCollection.updateOne({ channelId: channel.id }, { $set: { deleted: true } });
                break;

            default:
                break;
        }

    } catch (error) {
        await ErrorHandler.sendErrorMessage(client, error as Error, (c as TextChannel).guild);
        console.error(error);
    }
})

client.on('guildCreate', async g => {
    try {
        const setupChannel = await g.channels.create("setup", { type: 'GUILD_TEXT' });
        await setupChannel.send({ embeds: [Embeds.setupHereMessage] });
    } catch (error) {
        await ErrorHandler.sendErrorMessage(client, error as Error, (g as Guild));
        console.error(error);
    }
});

client.on('guildMemberAdd', async m => {
    const rankHandler = await RankHandler.createHandler(m);
    try {
        await rankHandler.setRanks(Rank.MEMBER);
    } catch (error) { }
})

DataBase.init().then(() => {
    dbConfigInit();
    languageInit();
    client.login(Config.TOKEN);
});