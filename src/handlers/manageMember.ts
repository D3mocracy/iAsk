import { Client, TextChannel, User } from "discord.js";
import DataBase from "../db";
import Components from "../embedsAndComps/components";
import Embeds from "../embedsAndComps/Embeds";
import { Action } from "../types";

class ManageMemberHanlder {
    private action: Action = {} as Action;
    constructor(private bot: Client, private manager: User, private member: User) {
        this.load();
    }

    async load() {
        this.action = await DataBase.memberManagementCollection.findOne({ managerId: this.manager.id }) as any;
    }

    async save() {
        await DataBase.memberManagementCollection.updateOne({ managerId: this.manager.id }, { $set: this.action }, { upsert: true });
    }

    async chooseMemberManage(channel: TextChannel) {
        await channel.send({ embeds: [Embeds.chooseGuild], components: [Components.chooseGuildMenu(this.bot, this)] });
    }
}