import { Message, SelectMenuInteraction, User } from "discord.js";
import DataBase from "../db";
import Components from "../embedsAndComps/components";
import Embeds from "../embedsAndComps/Embeds";
import { Note } from "../types";
import LanguageHandler from "./language";

class NewNoteHandler {
    private note: Note = {} as Note;
    private memberId: string = "";
    private lang: string = "";
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
        const memberManagement = await DataBase.memberManagementCollection.findOne({ managerId: this.manager.id });
        if (!memberManagement) return;
        this.note = await DataBase.noteCollection.findOne({ managerId: this.manager.id, content: { $exists: 0 }, deleted: false }) as any || this.note;
        this.note.guildId = memberManagement.guildId;
        this.memberId = memberManagement.memberId;
        this.lang = (await DataBase.guildsCollection.findOne({ guildId: this.note.guildId }))?.language || "en";
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

    getMessageFromLang(key: string) {
        return LanguageHandler.getMessageByLang(key, this.lang);
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
        if (!this.interaction || !this.interaction.channel || !this.note.guildId) return;
        this.note = { managerId: this.interaction.user.id, memberId: this.memberId, guildId: this.note.guildId, deleted: false };
        await this.interaction.channel.send(await this.getMessageFromLang('addNote'));
        await this.interaction.update({ embeds: [Embeds.noteMemberMessage(this.lang, this.note.memberId, this.note.guildId)], components: [Components.memberNoteMenu(this.lang)] });
    }

    async setNoteContent(message: Message) {
        this.note.content = message.content;
        await message.reply(this.getMessageFromLang('addNoteReply'));
    }
}

export default NewNoteHandler;