import { createTranscript } from "discord-html-transcripts";
import { DMChannel, MessageAttachment, MessageEmbed, TextChannel, Client } from "discord.js";
import DataBase from "../db";
import Embeds from "../embedsAndComps/Embeds";

namespace LogHandler {
    export async function logQuestionChannel(questionChannel: TextChannel, sendLogChannel: DMChannel | TextChannel, lang: string) {
        const attachment = await createTranscript(questionChannel, {
            limit: -1,
            returnType: "attachment",
            fileName: `question_log.html`,
            minify: false,
        }) as MessageAttachment;
        await sendLogChannel.send({ embeds: [Embeds.questionLogMessage(lang, questionChannel.id)], files: [attachment] });

    }

    export async function logManagerTool(logChannel: TextChannel, toolName: string, questionId: string, tag: string) {
        const guildId = (await DataBase.questionsCollection.findOne({ channelId: questionId }))?.guildId;
        const lang = (await DataBase.guildsCollection.findOne({ guildId }))?.language;
        await logChannel.send({ embeds: [Embeds.manageLogMessage(toolName, tag, questionId, lang)] })

    }
}

export default LogHandler;