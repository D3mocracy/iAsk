import { ButtonInteraction, Client, DMChannel, Guild, User } from "discord.js";
import { ObjectId } from "mongodb";
import DataBase from "../db";
import Components from "../embedsAndComps/components";
import Embeds from "../embedsAndComps/Embeds";
import { ManageMSG } from "../types";
import Utils from "../utils";
import LanguageHandler from "./language";

class ManagementMessageHanlder {
    private managementMessage: ManageMSG = {} as ManageMSG;
    private constructor(private manager: User, private bot: Client) { }

    static async createHandler(manager: User, bot: Client) {
        const handler = new ManagementMessageHanlder(manager, bot);
        await handler.load();
        return handler;
    }

    async load() {
        this.managementMessage = await DataBase.managementMessageCollection.findOne({
            managerId: this.manager.id,
            // memberId: this.member.id,
            // guildId: this.guild.id,
            sent: false,
            deleted: false,
        }) as any || this.managementMessage;
        this.managementMessage.lang = (await DataBase.memberManagementCollection.findOne({ managerId: this.manager.id }))?.lang || "en";
    }

    async save() {
        await DataBase.managementMessageCollection.updateOne({ _id: this.managementMessage._id }, { $set: this.managementMessage }, { upsert: true });
    }

    async sendSureMessageToManager(channel: DMChannel) {
        const guild = Utils.convertIDToGuild(this.bot, this.managementMessage.guildId) as Guild;
        await channel.send({
            content: "Are you sure?",
            embeds: [Embeds.managementMessage(this.managementMessage.lang, guild, this.managementMessage.content as string)],
            components: [Components.chooseSureManagementMessage(this.managementMessage.lang)]
        });
    };

    async setContent(content: string, channel: DMChannel) {
        this.managementMessage.content = content;
        await this.sendSureMessageToManager(channel);
    }

    async manageMessageDealer(interaction: ButtonInteraction) {
        const member = Utils.convertIDtoUser(this.bot, this.managementMessage.memberId);
        const guild = Utils.convertIDToGuild(this.bot, this.managementMessage.guildId);
        const score = LanguageHandler.getMessageByLang('managementMessageScore', this.managementMessage.lang);
        if (!member || !guild) return;
        if (interaction.customId === "mng-msg-yes") {
            await (await member?.createDM()).send({ embeds: [Embeds.managementMessage(this.managementMessage.lang, guild, this.managementMessage.content as string)] });
            this.managementMessage.sent = true;
            await interaction.update({ content: score.suc, embeds: [], components: [] });
        } else {
            await interaction.update({ content: score.fail, embeds: [], components: [] });
            this.managementMessage.deleted = true;
        }

    }

    static async isWritingManageMessage(managerId: string): Promise<boolean> {
        return !!await DataBase.managementMessageCollection.findOne({ managerId, sent: false, content: { $exists: 0 } });

    }

}

export default ManagementMessageHanlder;