require("dotenv").config();
import { Client, Intents, SelectMenuInteraction } from "discord.js";
import Config from "./config";
import DataBase from "./db";
import Components from "./embedsAndComps/components";
import Embeds from "./embedsAndComps/Embeds";
import ManageQuestionHandler from "./handlers/manageQuestion";
import OpenQuestionHandler from "./handlers/openQuestion";
import Utils from "./utils";
const client: Client = new Client({ partials: ["CHANNEL"], intents: new Intents(32767) });


client.on("ready", () => {
    console.log("iAsk is online! :D");
})

client.on("messageCreate", async message => {

    if (message.channel.type === "DM" && message.author != client.user) {
        const args = message.content.split(" ");

        if (Utils.commonGuilds(client, message.author).size === 0) {
            await message.channel.send(Config.error404);
            return;
        }


        if (args[0].toLowerCase() === Config.managePrefix) {
            if (args.length === 3) {
                if (args[1] === Config.manageChannel) {
                    // const manageQuestionHandler = await ManageQuestionHandler.createHandler(client, args[2], message.channel, message.author);
                    await message.reply({ embeds: [Embeds.questionManageMessage(args[2])], components: [Components.manageQuestionMenu()] });

                } else if (args[1] === Config.manageMember) {

                } else {
                    await message.channel.send({ embeds: [Embeds.worngUsageManageMsg] });
                }

            } else {
                await message.channel.send({ embeds: [Embeds.worngUsageManageMsg] });
            }
            return;
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
            }

            await options[interaction.values[0]]();
            await manageQuestionHandler.save();
            interaction.update({ components: [Components.manageQuestionMenu()] });

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
})



DataBase.init().then(() => client.login(Config.TOKEN));