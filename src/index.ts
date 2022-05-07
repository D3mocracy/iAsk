require("dotenv").config();
import { ButtonInteraction, Client, DMChannel, Intents, SelectMenuInteraction } from "discord.js";
import Config from "./config";
import DataBase from "./db";
import Handlers from "./handler";
import { Question } from "./types";
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
            await handler.save();
            await interaction.channel?.send(Config.chooseTitleMessage);
            await interaction.update({ content: `Your choice is ${(interaction as SelectMenuInteraction).values[0]}`, embeds: [], components: [] });
        }
    } else if (interaction.isButton()) {
        if (handler.questionObject.anonymous === undefined) {
            switch (interaction.customId) {
                case "anon-yes":
                    await handler.chooseAnonymous(true);
                    break;

                case "anon-no":
                    await handler.chooseAnonymous(false);
                    break;
            }
            await handler.save();
        } else if (!handler.questionObject.done) {
            switch (interaction.customId) {
                case "sure-yes":
                    await handler.chooseDone(true);
                    await handler.createChannelOnGuild();
                    await handler.save();
                    break;

                case "sure-no":
                    await handler.deleteQuestion();
                    break;
            }
        }

        interaction.update({ components: [] });
    }
})



DataBase.init().then(() => client.login(Config.TOKEN));