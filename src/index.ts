require("dotenv").config();
import { Client, Intents, SelectMenuInteraction } from "discord.js";
import Config from "./config";
import DataBase from "./db";
import Handlers from "./handler";
const client: Client = new Client({ partials: ["CHANNEL"], intents: new Intents(32767) });


client.on("ready", () => {
    console.log("iAsk is online! :D");
})

client.on("messageCreate", async message => {
    if (message.channel.type === "DM" && message.author != client.user) {
        if (Handlers.commonGuilds(client, message.author).size === 0) {
            await message.channel.send(Config.error404);
            return;
        }
        const handler = await Handlers.createHandler(client, message.author, message.channel);
        if (message.content.toLowerCase() === Config.iHaveAQuestionMessage.toLowerCase()) {//User sent "I have a question"
            await handler.iHaveAQuestion();
        } else if (!handler.questionObject.guildId) {
            await message.reply(Config.pleaseChooseGuildBeforeContinue);
        } else if (!handler.questionObject.title) {
            await handler?.chooseTitle(message.content);
        } else if (!handler.questionObject.description) {
            await handler?.chooseDescription(message.content);
        }
        await handler.save();
    }
});

client.on('interactionCreate', async interaction => {
    const handler = await Handlers.createHandler(client, interaction.user, interaction.channel);
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
        console.log(!handler.questionObject.channelId);
        console.log();


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