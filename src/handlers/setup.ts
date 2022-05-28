import { ButtonInteraction, Client, DMChannel, Guild, Message, TextChannel, Util } from "discord.js";
import { WithId } from "mongodb";
import DataBase from "../db";
import Components from "../embedsAndComps/components";
import Embeds from "../embedsAndComps/Embeds";
import { SetupConfig } from "../types";

class SetupHanlder {
    private guild: Guild = {} as Guild;
    private config: SetupConfig = {} as SetupConfig;
    private constructor(private bot: Client, private channel: TextChannel) { }

    static async createHandler(bot: Client, channel: TextChannel) {
        const handler = new SetupHanlder(bot, channel);
        await handler.load();
        return handler;
    }

    async load() {
        this.config = await DataBase.configCollection.findOne({ guildId: this.channel.guildId }) as any || this.config;
        this.guild = this.channel.guild;
        this.config.guildId = this.guild.id;
    }

    async save() {
        await DataBase.configCollection.updateOne({ guildId: this.channel.guildId }, { $set: this.config }, { upsert: true });
    }

    async sendSetupMessage() {
        const embed = Embeds.setupMessage;
        embed.setFields(
            { name: "Question Catagory:", value: String(this.config.questionCatagory), inline: false },
            { name: "Tool Log Channel ID:", value: String(this.config.manageToolLogChannelID), inline: false },
            { name: "Question Log Channel ID:", value: String(this.config.questionLogChannelID), inline: false },
            { name: "Max Question Per Member:", value: String(this.config.maxQuestions), inline: false },
            { name: "Notification Role ID:", value: String(this.config.notificationRoleID), inline: false },
            { name: "Member Role ID:", value: String(this.config.memberRoleID), inline: false },
            { name: "Trusted Role ID:", value: String(this.config.trustedRoleID), inline: false },
            { name: "Supervisor Role ID:", value: String(this.config.supervisorRoleID), inline: false },
            { name: "Manager Role ID:", value: String(this.config.managerRoleID), inline: false },
        );
        await this.channel.send({ embeds: [embed], components: [Components.helperButtons(), Components.setupMenu()] });
    };

    async setCatagory(id: string) {
        const catagory = this.guild.channels.cache.get(id);
        if (catagory && catagory.type === "GUILD_CATEGORY") {
            this.config.questionCatagory = id;
        } else {
            await this.channel.send("I don't think this is a catagory id...")
        }
    }

    async isChannel(id: string): Promise<boolean> {
        const channel = this.guild.channels.cache.get(id);
        if (!channel) return false;
        return channel.type === "GUILD_TEXT";
    }

    async isRole(id: string): Promise<boolean> {
        return !!this.guild.roles.cache.get(id);
    }

    async setConfigValue(key: string, value: string) {
        const options: any = {
            "question-catagory": async () => {
                await this.setCatagory(value);
            },
            "question-log-channel-id": async () => {
                if (await this.isChannel(value)) {
                    this.config.questionLogChannelID = value;
                } else { await this.channel.send("I don't think this is a channel id...") }
            },
            "tool-log-channel-id": async () => {
                if (await this.isChannel(value)) {
                    this.config.manageToolLogChannelID = value
                } else { await this.channel.send("I don't think this is a channel id...") }
            },
            "max-questions-per-member": async () => {
                if (!isNaN(+value)) {
                    this.config.maxQuestions = +value
                } else { await this.channel.send("Please type a number") }
            },
            "notification-role-id": async () => {
                if (await this.isRole(value)) {
                    this.config.notificationRoleID = value
                } else { await this.channel.send("I don't think this is a role id...") }
            },
            "member-role-id": async () => {
                if (await this.isRole(value)) {
                    this.config.memberRoleID = value
                } else { await this.channel.send("I don't think this is a role id...") }
            },
            "trusted-role-id": async () => {
                if (await this.isRole(value)) {
                    this.config.trustedRoleID = value
                } else { await this.channel.send("I don't think this is a role id...") }
            },
            "supervisor-role-id": async () => {
                if (await this.isRole(value)) {
                    this.config.supervisorRoleID = value
                } else { await this.channel.send("I don't think this is a role id...") }
            },
            "manager-role-id": async () => {
                if (await this.isRole(value)) {
                    this.config.managerRoleID = value
                } else { await this.channel.send("I don't think this is a role id...") }
            },
        }
        await options[key]();
        this.config.done = await this.checkDone();
    }

    async checkDone(): Promise<boolean> {
        return !!(this.config.guildId &&
            this.config.questionCatagory &&
            this.config.manageToolLogChannelID &&
            this.config.questionLogChannelID &&
            this.config.maxQuestions &&
            this.config.notificationRoleID &&
            this.config.memberRoleID &&
            this.config.trustedRoleID &&
            this.config.supervisorRoleID &&
            this.config.managerRoleID);
    }

    async sendHelpers(message: Message, btn: ButtonInteraction) {
        const sendHelpers: any = {
            'hlp-catagory': async () => message.channel.send({ embeds: [Embeds.catagoryHelper(btn.guild!)] }),
            'hlp-channel': async () => message.channel.send({ embeds: [Embeds.channelHelper(btn.guild!)] }),
            'hlp-role': async () => message.channel.send({ embeds: [Embeds.roleHelper(btn.guild!)] }),
        };
        await sendHelpers[btn.customId]();
    }

    async sendProlog(content: string) {
        if (content === "fast") { await this.sendSetupMessage(); return; }
        await this.sendMessageWithDelay("Oh.. Hi there little strager", 2);
        await this.sendMessageWithDelay("Let me introduce myself, my name is iAsk and I will be your assistant for the setup today", 3);
        await this.sendMessageWithDelay("Let's begin the setup procces.", 1);
        await this.sendMessageWithDelay("Your are about to setup your community, which means you will be asked for some id's", 3);
        await this.sendMessageWithDelay("ID's like catagories, channels and even roles.", 2);
        await this.sendMessageWithDelay("You can get those id's by turn on the developer options on you discord client.", 3);
        await this.sendMessageWithDelay("If you don't want to do it you don't have to. I suggested the helper buttons (you will understand in a minute)", 4);
        await this.sendMessageWithDelay("You can click on one of the helper button (e.g: Channel Helper Button) to get a list of all the channels here with their id", 4);
        await this.sendMessageWithDelay("Once you finish the setup procces, your guild will be registered in my system and members will be able to start using all the features! isn't it exciting?", 5);
        await this.sendMessageWithDelay("What are we waiting for? Let's begin :D", 2);
        await this.sendSetupMessage();
    }

    sendMessageWithDelay(content: string, seconds: number): Promise<void> {
        return new Promise(async resolve => {
            await this.channel.sendTyping();
            setTimeout(async () => {
                await this.channel.send(content);
                resolve();
            }, seconds * 1000);
        });
    }

    static async isMissingValuess(guildId: string) {
        const config: SetupConfig = await DataBase.configCollection.findOne({ guildId }) as any;
        return !!config.done;
    }

    static async getMaxQuestion(guildId: string): Promise<Number> {
        const doc = await DataBase.configCollection.findOne({ guildId });
        if (!doc) return 0;
        return doc.maxQuestions;
    }

    static async getConfigObject(guildId: string): Promise<SetupConfig> {
        const doc: SetupConfig = await DataBase.configCollection.findOne({ guildId }) as any;
        if (!doc) return {} as SetupConfig;
        return doc;
    }
}

export default SetupHanlder;