import { MessageEmbed, SelectMenuInteraction } from "discord.js";
import { ObjectId } from "mongodb";
import Config from "../config";
import DataBase from "../db";
import Components from "../embedsAndComps/components";
import Embeds from "../embedsAndComps/Embeds";
import { Note } from "../types";
import LanguageHandler from "./language";

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
        const memberManagement = await DataBase.memberManagementCollection.findOne({ managerId: this.interaction.user.id });
        if (!memberManagement) return;
        this.memberId = memberManagement.memberId;
        this.managerId = this.interaction.user.id;
        this.guildId = memberManagement.guildId;
        this.notes = await DataBase.noteCollection.find({ managerId: this.managerId, memberId: this.memberId, guildId: this.guildId, deleted: false }).toArray() as any;
    }

    async getLang() {
        return (await DataBase.guildsCollection.findOne({ guildId: this.guildId }))?.language || "en";
    }

    async getMessageFromLang(key: string) {
        return LanguageHandler.getMessageByLang(key, await this.getLang());
    }

    async sendShowAllNotesMessage() {
        if (!this.notes || !this.interaction.channel) return;
        const embed = new MessageEmbed({
            title: await this.getMessageFromLang('memberNotes'),
            color: 'GREY',
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
            title: await this.getMessageFromLang('notesReseted'),
            color: "DARK_RED",
        });
        (await DataBase.noteCollection.updateMany({ memberId: this.memberId, guildId: this.guildId }, { $set: { deleted: true } }));
        await this.interaction.channel.send({ embeds: [embed] });
        await this.updateEmbedAndCompToNoteSystem();
    };

    async updateToRemoveNotesMessage() {
        if (this.notes.length === 0) {
            await this.interaction.reply(await this.getMessageFromLang('errorNotes'));
            return;
        }
        await this.interaction.update({ embeds: [Embeds.chooseNoteToRemove(await this.getLang(), this.memberId, this.guildId)], components: [Components.removeNoteMenu(await this.getLang(), this.notes as any)] });
    }

    private async updateEmbedAndCompToNoteSystem() {
        await this.interaction.update({
            embeds: [Embeds.noteMemberMessage(await this.getLang(), this.memberId, this.guildId)], components: [Components.memberNoteMenu(await this.getLang())]
        });
    };

    async removeNote() {
        const _id = new ObjectId(this.interaction.values[0]);
        await DataBase.noteCollection.updateOne({ _id }, { $set: { deleted: true } });
        await this.updateEmbedAndCompToNoteSystem();
        if (!this.interaction.channel) return;
        await this.interaction.channel.send(await this.getMessageFromLang('removeNotesReply'));
    }
}

export default NoteManageHanlder;