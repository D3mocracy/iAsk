import { MessageEmbed, SelectMenuInteraction } from "discord.js";
import { ObjectId } from "mongodb";
import Config from "../config";
import DataBase from "../db";
import Components from "../embedsAndComps/components";
import Embeds from "../embedsAndComps/Embeds";
import { Note } from "../types";

class NoteManageHanlder {
    private notes: Note[] = [];
    private managerId: string = "";
    private memberId: string = "";
    private guildId: string = "";
    private constructor(private interaction: SelectMenuInteraction) { }

    static async createHanlder(interaction: SelectMenuInteraction) {
        const handler = new NoteManageHanlder(interaction);
        await handler.load();
        return handler;
    }

    async load() {
        this.memberId = (this.interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === Config.memberIDFooter)?.value as string;
        this.managerId = this.interaction.user.id;
        this.guildId = (this.interaction as SelectMenuInteraction).message.embeds[0].fields?.find(f => f.name === "Guild ID:")?.value as string;
        this.notes = await DataBase.noteCollection.find({ managerId: this.managerId, memberId: this.memberId, guildId: this.guildId, deleted: false }).toArray() as any;

    }

    async sendShowAllNotesMessage() {
        if (!this.notes || !this.interaction.channel) return;
        const embed = new MessageEmbed({
            title: "Member Notes",
            description: this.notes.map((n, i) =>
                `**${i + 1}) ** ${n.content}`
            ).join('\n')
        });
        await this.interaction.channel.send({ embeds: [embed] });
        await this.updateEmbedAndCompToNoteSystem();
    }

    async softDeleteAllNotes() {
        if (!this.interaction.channel) return;
        const embed = new MessageEmbed({
            title: "Notes Reseted",
            color: "DARK_RED",
        });
        (await DataBase.noteCollection.updateMany({ memberId: this.memberId, guildId: this.guildId }, { $set: { deleted: true } }));
        await this.interaction.channel.send({ embeds: [embed] });
        await this.updateEmbedAndCompToNoteSystem();
    };

    async updateToRemoveNotesMessage() {
        if (this.notes.length === 0) {
            await this.interaction.reply("Member doesn't have any notes..pff shame on him!");
            return;
        }
        await this.interaction.update({ embeds: [Embeds.chooseNoteToRemove(this.memberId, this.guildId)], components: [Components.removeNoteMenu(this.notes as any)] });
    }

    private async updateEmbedAndCompToNoteSystem() {
        await this.interaction.update({
            embeds: [Embeds.noteMemberMessage(this.memberId, this.guildId)], components: [Components.memberNoteMenu()]
        });
    };

    async removeNote() {
        const _id = new ObjectId(this.interaction.values[0]);
        await DataBase.noteCollection.updateOne({ _id }, { $set: { deleted: true } });
        await this.updateEmbedAndCompToNoteSystem();
        if (!this.interaction.channel) return;
        await this.interaction.channel.send("We don't need this note!")
    }
}

export default NoteManageHanlder;