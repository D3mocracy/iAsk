require("dotenv").config();
import { Client, Intents, SelectMenuInteraction } from "discord.js";
import Config from "./config";
import DataBase from "./db";
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
        if (Utils.commonGuilds(client, message.author).size === 0) {
            await message.channel.send(Config.error404);
            return;
        }
        const openQuesitonHandler = await OpenQuestionHandler.createHandler(client, message.author, message.channel);

        if (message.content.toLowerCase() === Config.iHaveAQuestionMessage.toLowerCase() && !openQuesitonHandler.questionObject.started) {
            await openQuesitonHandler.iHaveAQuestion();
        } else if (!openQuesitonHandler.questionObject.guildId) {
            await message.reply(Config.pleaseChooseGuildBeforeContinue);
        } else if (!openQuesitonHandler.questionObject.title) {
            await openQuesitonHandler?.chooseTitle(message.content);
        } else if (!openQuesitonHandler.questionObject.description) {
            await openQuesitonHandler?.chooseDescription(message.content);
        }

        const args = message.content.split(" ");
        if (args.length === 3) {
            if (args[0].toLowerCase() === Config.managePrefix) {
                if (args[1] === Config.manageQuestion) {
                    const manageQuestionHandler = await ManageQuestionHandler.createHandler(client, args[2], message.author);

                } else if (args[1] === Config.manageMember) {

                } else {
                    await message.channel.send({ embeds: [Embeds.worngUsageManageMsg] });
                }

            }
        } else {
            await message.channel.send({ embeds: [Embeds.worngUsageManageMsg] });
        }

        await openQuesitonHandler.save();
    }
});

client.on('interactionCreate', async interaction => {
    const handler = await OpenQuestionHandler.createHandler(client, interaction.user, interaction.channel);
    if (interaction.isSelectMenu()) {
        if (interaction.customId === "choose-guild") {
            await handler.chooseGuild(interaction.values[0]);
            if (await handler.isReachedLimit()) {
                interaction.channel?.send(Config.reachLimitQuestionsError);
                await handler.deleteQuestion();
                await interaction.deferUpdate();
                return;
            }
            await handler.save();
            await interaction.channel?.send(Config.chooseTitleMessage);
            await interaction.update({ content: `Your choice is ${(interaction as SelectMenuInteraction).values[0]}`, embeds: [], components: [] });
        }

    } else if (interaction.isButton()) {
        if (handler.questionObject.anonymous === undefined) {
            await handler.chooseAnonymous(interaction.customId === "anon-yes");
        } else if (!handler.questionObject.channelId) {
            if (interaction.customId === "sure-yes") {
                await handler.createChannelOnGuild();
                await interaction.channel?.send(Config.succsesMsg);
            } else {
                await handler.deleteQuestion();
            }
        }
        await handler.save();
        interaction.update({ components: [] });
    }
})



DataBase.init().then(() => client.login(Config.TOKEN));