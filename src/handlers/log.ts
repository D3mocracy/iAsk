import { createTranscript } from "discord-html-transcripts";
import { Client, DMChannel, TextChannel } from "discord.js";
import Embeds from "../embedsAndComps/Embeds";
import ManageQuestionHandler from "./manageQuestion";
import SetupHanlder from "./setup";

namespace LogHandler {
    export async function logQuestionChannel(questionChannel: TextChannel, sendLogChannel: DMChannel | TextChannel) {
        const attachment = await createTranscript(questionChannel, {
            limit: -1,
            returnType: "attachment",
            fileName: `question_log.html`
        });
        await sendLogChannel.send({ files: [attachment] });
    }

    export async function logManagerTool(bot: Client, logChannel: TextChannel, toolName: string, questionId: string, tag: string) {
        await logChannel.send({ embeds: [Embeds.manageLogMessage(toolName, tag, questionId)] })

    }
}

export default LogHandler;