require("dotenv").config();
import { Client, DMChannel, Intents, SelectMenuInteraction, TextChannel } from "discord.js";
import Config from "./config";
import DataBase from "./db";
import Components from "./embedsAndComps/components";
import Embeds from "./embedsAndComps/Embeds";
import ChangeDetailsHandler from "./handlers/changeDetails";
import ManageMemberHanlder from "./handlers/manageMember";
import NewNoteHandler from "./handlers/newNote";
import ManageQuestionHandler from "./handlers/manageQuestion";
import OpenQuestionHandler from "./handlers/openQuestion";
import Utils from "./utils";
import NoteManageHanlder from "./handlers/noteManage";
import ManagementMessageHanlder from "./handlers/managementMessage";
import SetupHanlder from "./handlers/setup";
const client: Client = new Client({ partials: ["CHANNEL"], intents: new Intents(32767) });


client.on("ready", async () => {
    console.log("iAsk is online! :D");
})

client.on("messageCreate", async message => {

    if (message.channel.type === "DM" && message.author != client.user) {
        const args = message.content.split(" ");
        // await Utils.getDoneGuildsID();


        if ((await Utils.commonGuildCheck(client, message.author)).length === 0) {
            await message.channel.send(Config.error404);
            return;
        }

        if (await NewNoteHandler.isAddingNote(message.author.id)) {
            const managerNoteHandler = await NewNoteHandler.createHandler(message.author);
            managerNoteHandler.setNoteContent(message);
            await managerNoteHandler.save();
            await ManageMemberHanlder.exit(message.author.id);
            return;
        }

        if (await ManagementMessageHanlder.isWritingManageMessage(message.author.id)) {
            const managementMessageHandler = await ManagementMessageHanlder.createHandler(message.author, client);
            await managementMessageHandler.setContent(message.content, message.channel as DMChannel);
            await managementMessageHandler.save();
            return;
        }

        if (await ChangeDetailsHandler.checkIfUserIsManagingDetail(message.author)) {
            const changeDetailHandler = await ChangeDetailsHandler.createHandler(client, message.author.id);
            if (changeDetailHandler === undefined) return;
            const detail = changeDetailHandler.manageObject.status;
            const options: any = {
                "change-title": async () => changeDetailHandler?.setTitle(message.content),
                "change-description": async () => changeDetailHandler?.setDescription(message.content),
            }

            await options[detail]();
            await changeDetailHandler?.save();
            await changeDetailHandler.exit();
            return;
        }

        if (args[0].toLowerCase() === Config.managePrefix) {
            if (args.length === 3) {
                if (args[1] === Config.manageChannel) {
                    await message.reply({ embeds: [Embeds.questionManageMessage(args[2])], components: [Components.manageQuestionMenu()] });

                } else if (args[1] === Config.manageMember) {
                    const user = await client.users.fetch(args[2])
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

        const openQuesitonHandler = await OpenQuestionHandler.createHandler(client, message.author, message.channel);

        if (message.content.toLowerCase() === Config.iHaveAQuestionMessage && !openQuesitonHandler.questionObject.started) {
            await openQuesitonHandler.iHaveAQuestion();
            await openQuesitonHandler.save();
            return;
        }

        if (await OpenQuestionHandler.checkIfUserHasQuestionOnDB(message.author)) {
            if (!openQuesitonHandler.questionObject.guildId) {
                await message.reply(Config.pleaseChooseGuildBeforeContinue);

            } else if (!openQuesitonHandler.questionObject.title) {
                await openQuesitonHandler.chooseTitle(message.content);

            } else if (!openQuesitonHandler.questionObject.description) {
                await openQuesitonHandler.chooseDescription(message.content);
            }
            await openQuesitonHandler.save();
            return;
        }
    } else if (message.channel.type === "GUILD_TEXT" && message.author != client.user) {
        if (message.content === "!setup") {
            if (!message.guildId) return;
            const setupHandler = await SetupHanlder.createHandler(client, message.channel as TextChannel);
            await message.channel.sendTyping();
            await message.channel.send({ content: "Oh, hello there little strager :D" });
            await message.channel.sendTyping();
            await setupHandler.sendSetupMessage(message.channel as TextChannel);

            const buttonCollector = message.channel.createMessageComponentCollector({ componentType: 'BUTTON' });
            buttonCollector.on('collect', async btn => {
                if (!btn.guild) return;
                const sendHelpers: any = {
                    'hlp-catagory': async () => message.channel.send({ embeds: [Embeds.catagoryHelper(btn.guild!)] }),
                    'hlp-channel': async () => message.channel.send({ embeds: [Embeds.channelHelper(btn.guild!)] }),
                    'hlp-role': async () => message.channel.send({ embeds: [Embeds.roleHelper(btn.guild!)] }),
                };
                await sendHelpers[btn.customId]();
                try {
                    await btn.deferUpdate();
                } catch (error) { }
            })

            const interactionCollector = message.channel.createMessageComponentCollector({ componentType: 'SELECT_MENU' });
            interactionCollector.on('collect', async i => {
                if (!i.channel) return;

                await i.update({ content: `**Please type the new ${i.values[0].replaceAll("-", " ")}**`, embeds: [], components: [] });

                const messageCollector = i.channel.createMessageCollector({ max: 1 });
                messageCollector.on('collect', async m => {
                    if (m.author.bot) return;
                    await setupHandler.setConfigValue(i.values[0], m.content);
                    await setupHandler.save();
                    await m.channel.sendTyping();
                    await setupHandler.sendSetupMessage(i.channel as TextChannel);
                });
            })
        }
    }
});

client.on('interactionCreate', async interaction => {

    if (interaction.isSelectMenu()) {
        if (interaction.customId === "choose-guild-open-question") {
            if (await SetupHanlder.isMissingValues(interaction.values[0])) {
                await interaction.update("Sorry, you can't open a new question on that guild right now.")
                return;
            }
            const openQuestionHandler = await OpenQuestionHandler.createHandler(client, interaction.user, interaction.channel);

            await openQuestionHandler.chooseGuild(interaction.values[0]);
            if (await openQuestionHandler.isReachedLimit()) {
                interaction.channel?.send(Config.reachLimitQuestionsError);
                await openQuestionHandler.deleteQuestion();
                await openQuestionHandler.save();
                await interaction.deferUpdate();
                return;
            }
            await openQuestionHandler.save();
            await interaction.channel?.send(Config.chooseTitleMessage);
            await interaction.update({ content: `Your choice is ${(interaction as SelectMenuInteraction).values[0]}`, embeds: [], components: [] });

        } else if (interaction.customId === "choose-guild-manage-member") {
            const memberId = await ManageMemberHanlder.getMemberIdFromDBByManagerId(interaction.user);
            const manageMemberHanlder = await ManageMemberHanlder.createHandler(client, interaction.user, memberId);
            await manageMemberHanlder.chooseGuild(interaction.values[0]);
            await manageMemberHanlder.save();
            await interaction.update({ embeds: [Embeds.memberManageMessage(memberId, interaction.values[0])], components: [Components.memberManagementMenu()] });

        } else if (interaction.customId === "channel-mng") {
            const managedChannelId: string = (interaction as SelectMenuInteraction).message.embeds[0].footer?.text.replaceAll(`${Config.channelIDFooter} `, "") as any;
            const manageQuestionHandler = await ManageQuestionHandler.createHandler(client, managedChannelId, interaction.channel, interaction.user);
            if (!manageQuestionHandler) return;

            const options: any = {
                "question-del": async () => manageQuestionHandler.deleteQuestion(),
                "question-lock": async () => manageQuestionHandler.lockQuestion(),
                "question-unlock": async () => manageQuestionHandler.unlockQuestion(),
                "question-reveal": async () => manageQuestionHandler.revealUserTag(),
                "question-log": async () => manageQuestionHandler.logQuestion(),
                "question-details-change": async () => manageQuestionHandler.chooseChangeDetail(),
            }

            await options[interaction.values[0]]();
            await manageQuestionHandler.save();
            interaction.update({ components: [Components.manageQuestionMenu()] });

        } else if (interaction.customId === "change-dtl") {
            const managedChannelId: string = (interaction as SelectMenuInteraction).message.embeds[0].footer?.text.replaceAll(`${Config.channelIDFooter} `, "") as any;
            const manageQuestionHandler = await ManageQuestionHandler.createHandler(client, managedChannelId, interaction.channel, interaction.user);
            if (!manageQuestionHandler) return;
            if (interaction.values[0] === "change-anonymous") {
                await manageQuestionHandler.switchAnonymous();
            } else {
                await manageQuestionHandler.changeDetail(interaction.values[0]);
            }
            await manageQuestionHandler.save();
            interaction.update({ components: [Components.changeDetails()] });

        } else if (interaction.customId === "mbr-mng") {
            const memberId = await ManageMemberHanlder.getMemberIdFromDBByManagerId(interaction.user);
            const manageMemberHanlder = await ManageMemberHanlder.createHandler(client, interaction.user, memberId);

            const options: any = {
                "mbr-kick": async () => manageMemberHanlder.kickMember(interaction),
                "mbr-ban": async () => manageMemberHanlder.banMember(interaction),
                "mbr-block": async () => manageMemberHanlder.updateToBlockMenu(interaction),
                "mbr-note": async () => manageMemberHanlder.updateToNoteMenu(interaction),
                "mbr-management-msg": async () => manageMemberHanlder.insertDetailsToManagementMessageHandler(interaction),
                // "mbr-rank": async () => manageMemberHanlder.chooseChangeDetail(),
            }

            await options[interaction.values[0]]();
            await manageMemberHanlder.save();

        } else if (interaction.customId === "block-mbr") {
            const memberId = await ManageMemberHanlder.getMemberIdFromDBByManagerId(interaction.user);
            const manageMemberHanlder = await ManageMemberHanlder.createHandler(client, interaction.user, memberId);
            await manageMemberHanlder.blockMember(interaction);

        } else if (interaction.customId === "note-mbr") {
            const noteManageHanlder = await NoteManageHanlder.createHanlder(interaction);

            const options: any = {
                "note-add": async () => {
                    const newNoteHandler = await NewNoteHandler.createHandler(interaction.user, interaction);
                    newNoteHandler.addNote()
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
        if (interaction.customId === "mng-msg-yes" || interaction.customId === "mng-msg-no") {
            const managementMessageHandler = await ManagementMessageHanlder.createHandler(interaction.user, client);
            await managementMessageHandler.manageMessageDealer(interaction);

            await managementMessageHandler.save();
            return;
        }
        const openQuestionHandler = await OpenQuestionHandler.createHandler(client, interaction.user, interaction.channel);
        if (openQuestionHandler.questionObject.anonymous === undefined) {
            await openQuestionHandler.chooseAnonymous(interaction.customId === "anon-yes");
        } else if (!openQuestionHandler.questionObject.channelId) {
            if (interaction.customId === "sure-yes") {
                await openQuestionHandler.createChannelOnGuild();
                await interaction.channel?.send(Config.succsesMsg);
            } else {
                await openQuestionHandler.deleteQuestion();
            }
        }
        await openQuestionHandler.save();

        interaction.update({ embeds: [], components: [] });

    }
});


DataBase.init().then(() => client.login(Config.TOKEN));