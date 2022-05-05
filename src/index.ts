require("dotenv").config();
import { Client, Intents } from "discord.js";
import Config from "./config";
import Handlers from "./handler";
const client: Client = new Client({ partials: ["CHANNEL"], intents: new Intents(32767) });

client.on("ready", () => {
    console.log("iAsk is online! :D");
})

client.on("messageCreate", async message => {
    if (message.content.toLowerCase() === Config.iHaveAQuestionMessage.toLowerCase()) {
        const handler = new Handlers(message.channel);
        await handler.iHaveAQuestion();
        await handler.save();
    }
})