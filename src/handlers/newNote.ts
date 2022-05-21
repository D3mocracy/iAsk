import { Message, MessageEmbed, SelectMenuInteraction, User } from "discord.js";
import Config from "../config";
import DataBase from "../db";
import Components from "../embedsAndComps/components";
import Embeds from "../embedsAndComps/Embeds";
import { Note } from "../types";
import ManageMemberHanlder from "./manageMember";

class NewNoteHandler {
    private note: Note = {} as Note;
    private guildId: string = "";
    private memberId: string = "";
    constructor(private manager: User, private interaction?: SelectMenuInteraction) { }

    static async createHandler(manager: User, interaction?: SelectMenuInteraction) {
        const handler = new NewNoteHandler(manager);
        handler.interaction = interaction;
        try {
            await handler.load();
        } catch (error) {
            console.log(error);

        }
        return handler;
    }

    async load() {
        this.note = await DataBase.noteCollection.findOne({ managerId: this.manager.id, content: { $exists: 0 }, deleted: false }) as any || this.note;

        if (this.interaction !== undefined) {
            this.guildId = (this.interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === "Guild ID:")?.value as string;
            this.memberId = (this.interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === Config.memberIDFooter)?.value as string;
        }
    }

    async save() {
        if (!this.note._id) {
            await DataBase.noteCollection.insertOne(this.note);
        } else {
            try {
                await DataBase.noteCollection.updateOne({ _id: this.note._id }, { $set: this.note }, { upsert: true });
            } catch (error) {
                console.log(error);
            }
        }

    }

    async getActionName() {
        const doc = await DataBase.memberManagementCollection.findOne({ managerId: this.note.managerId });
        if (!doc) return;
        return doc.actionName;
    }

    static async isAddingNote(managerId: string) {
        const note = await DataBase.noteCollection.findOne({ managerId, content: { $exists: 0 } });
        return !!note;
    }

    async addNote() {
        if (!this.interaction || !this.interaction.channel) return;
        // const guildId: string = (this.interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === "Guild ID:")?.value as string;
        // const memberId: string = (this.interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === Config.memberIDFooter)?.value as string;
        this.note = { managerId: this.interaction.user.id, memberId: this.memberId, guildId: this.guildId, deleted: false }
        await this.interaction.channel.send("Please write the note you would like to add.")
        await this.interaction.update({ embeds: [Embeds.noteMemberMessage(this.note.memberId, this.note.guildId)], components: [Components.memberNoteMenu()] });
    }

    async sendRemoveNoteMessage() {
        if (!this.interaction || !this.interaction.channel) return;
        await this.interaction.channel.send("Please type the note **number** you would like to remove.");
        await this.interaction.update({ embeds: [Embeds.noteMemberMessage(this.note.memberId, this.note.guildId)], components: [Components.memberNoteMenu()] });
    }

    async setNoteContent(message: Message) {
        this.note.content = message.content;
        await message.reply("Oh wow! that a really nice note right there :D")
    }
}

export default NewNoteHandler;