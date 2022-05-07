import { Guild } from "discord.js"

export type Question = {
    authorId: string,
    deleted?: boolean,
    guildId?: string,
    counter?: number,
    title?: string,
    description?: string,
    anonymous?: boolean,
    channelId?: string,
}