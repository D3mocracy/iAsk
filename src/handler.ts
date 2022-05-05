import { DMChannel, User } from "discord.js";
import Config from "./config";
import { Question } from "./types";

class Handlers {
    private channel: DMChannel;
    private question?: Question;
    constructor(user: User, channel: any) {
        this.channel = channel;
    }

    async iHaveAQuestion() {
        this.question = {};
        await this.channel.send(Config.chooseTitleMessage);
    }

    async save() { /*TO DO ODO*/ }
}

export default Handlers;