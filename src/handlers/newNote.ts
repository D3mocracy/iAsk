import { Guild, Interaction, Message, MessageEmbed, SelectMenuInteraction, User } from "discord.js";
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
        this.note = await DataBase.noteCollection.findOne({ managerId: this.manager.id, content: { $exists: 0 } }) as any;
        if (this.interaction !== undefined) {
            this.guildId = (this.interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === "Guild ID:")?.value as string;
        }
    }

    async save() {
        try {
            await DataBase.noteCollection.updateOne({ managerId: this.manager.id, memberId: this.note.memberId }, { $set: this.note }, { upsert: true });
        } catch (error) {
            console.log(error);

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
        const guildId: string = (this.interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === "Guild ID:")?.value as string;
        const memberId: string = (this.interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === Config.memberIDFooter)?.value as string;
        this.note = { managerId: this.interaction.user.id, memberId, guildId }
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

    async resetNotes() {
        if (!this.interaction) return;
        const guildId: string = (this.interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === "Guild ID:")?.value as string;
        const memberId: string = (this.interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === Config.memberIDFooter)?.value as string;
        await DataBase.noteCollection.deleteMany({ memberId, guildId });
        await this.interaction.update({ content: "Reset Notes", embeds: [], components: [] });
        await ManageMemberHanlder.exit(this.manager.id);
    }

    async removeNote(noteNumber: number) {
        const notes = await this.getAllNotes();
        if (!notes || !this.interaction) return;
        const note = notes[noteNumber];
        await DataBase.noteCollection.deleteOne({ memberId: this.note.memberId, guildId: this.note.guildId, note });
        await this.interaction.update({ content: "Note removed", embeds: [], components: [] });
        return await this.getAllNotes();
    }

    async getAllNotes() {
        if (!this.interaction) return;
        const guildId: string = (this.interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === "Guild ID:")?.value as string;
        const memberId: string = (this.interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === Config.memberIDFooter)?.value as string;
        return await DataBase.noteCollection.find({ memberId, guildId }).toArray();

    }

    async showAllNotes() {
        if (!this.interaction || !this.interaction.channel) return;
        const notes = await this.getAllNotes();
        if (!notes) return;
        const embed = new MessageEmbed({
            title: "Member Notes",
            description: notes.map((n, i) =>
                `**${i}) ** ${n.content}`
            ).join('\n')
        });
        await this.interaction.channel.send({ embeds: [embed] });
        await this.interaction.update({ embeds: [Embeds.noteMemberMessage(this.note.memberId, this.note.guildId)], components: [Components.memberNoteMenu()] });
    }
}

export default NewNoteHandler;