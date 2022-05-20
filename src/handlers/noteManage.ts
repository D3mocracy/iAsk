import { MessageEmbed, SelectMenuInteraction } from "discord.js";
import { ObjectId } from "mongodb";
import Config from "../config";
import DataBase from "../db";
import Components from "../embedsAndComps/components";
import Embeds from "../embedsAndComps/Embeds";
import { Note } from "../types";

class NoteManageHanlder {
    private note: Note = {} as Note;
    private constructor(private managerId: string, private memberId: string, private guildId: string) { }

    static async createHanlder(managerId: string, memberId: string, guildId: string) {
        const handler = new NoteManageHanlder(managerId, memberId, guildId);
        await handler.load();
        return handler;
    }

    async load() {
        this.note = await DataBase.noteCollection.findOne({ managerId: this.managerId, memberId: this.memberId, guildId: this.guildId }) as any;
    }

    async save() {
        await DataBase.noteCollection.updateOne({ _id: this.note._id }, { $set: this.note }, { upsert: true })
    }

    static async getAllNotes(interaction: SelectMenuInteraction) {
        const guildId: string = (interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === "Guild ID:")?.value as string;
        const memberId: string = (interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === Config.memberIDFooter)?.value as string;
        return await DataBase.noteCollection.find({ memberId, guildId }).toArray();

    }

    static async sendShowAllNotesMessage(interaction: SelectMenuInteraction) {
        const guildId: string = (interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === "Guild ID:")?.value as string;
        const memberId: string = (interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === Config.memberIDFooter)?.value as string;
        const notes = await DataBase.noteCollection.find({ memberId, guildId }).toArray();
        if (!notes || !interaction.channel) return;
        const embed = new MessageEmbed({
            title: "Member Notes",
            description: notes.map((n, i) =>
                `**${i}) ** ${n.content}`
            ).join('\n')
        });
        await interaction.channel.send({ embeds: [embed] });
        await interaction.update({
            embeds: [Embeds.noteMemberMessage(memberId, guildId)], components: [Components.memberNoteMenu()]
        });
    }

    static async resetAllNotes(interaction: SelectMenuInteraction) {
        const guildId: string = (interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === "Guild ID:")?.value as string;
        const memberId: string = (interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === Config.memberIDFooter)?.value as string;
        const notes = await DataBase.noteCollection.find({ memberId, guildId }).toArray();
        if (!notes || !interaction.channel) return;
        const embed = new MessageEmbed({
            title: "Notes Reseted",
            color: "DARK_RED",
        });
        await interaction.channel.send({ embeds: [embed] });
        await interaction.update({
            embeds: [Embeds.noteMemberMessage(memberId, guildId)], components: [Components.memberNoteMenu()]
        });
    };

    async updateToRemoveNotesMessage(interaction: SelectMenuInteraction) {
        const notes = await DataBase.noteCollection.find({ memberId: this.memberId, guildId: this.guildId }).toArray();
        await interaction.update({ embeds: [Embeds.choseNoteToRemove(this.memberId, this.guildId)], components: [Components.removeNoteMenu(notes as any)] });
    }
}

export default NoteManageHanlder;