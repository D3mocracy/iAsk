require("dotenv").config();
import { ButtonInteraction, Client, Intents, SelectMenuInteraction, TextChannel } from "discord.js";
import Config from "./config";
import DataBase from "./db";
import Components from "./embedsAndComps/components";
import Embeds from "./embedsAndComps/Embeds";
import ChangeDetailsHandler from "./handlers/changeDetails";
import ManageQuestionHandler from "./handlers/manageQuestion";
import OpenQuestionHandler from "./handlers/openQuestion";
import Utils from "./utils";
const client: Client = new Client({ partials: ["CHANNEL"], intents: new Intents(32767) });


client.on("ready", async () => {
    console.log("iAsk is online! :D");
})

client.on("messageCreate", async message => {

    if (message.channel.type === "DM" && message.author != client.user) {
        const args = message.content.split(" ");

        if (Utils.commonGuilds(client, message.author).size === 0) {
            await message.channel.send(Config.error404);
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

        if (args[0].toLowerCase() === Config.managePrefix) { //check first word is !manage
            if (args.length === 3) { //check if message has 3 arguments
                if (args[1] === Config.manageChannel) { //if choose to manage channel
                    // const manageQuestionHandler = await ManageQuestionHandler.createHandler(client, args[2], message.channel, message.author);
                    await message.reply({ embeds: [Embeds.questionManageMessage(args[2])], components: [Components.manageQuestionMenu()] });

                } else if (args[1] === Config.manageMember) { //if choose to manage user

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

    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isSelectMenu()) {
        if (interaction.customId === "choose-guild") {
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
        }

    } else if (interaction.isButton()) {
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