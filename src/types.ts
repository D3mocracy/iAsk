import { Guild } from "discord.js"
import { ObjectId } from "mongodb"

export type Question = {
    started?: boolean,
    _id?: ObjectId,
    authorId: string,
    deleted: boolean,
    guildId?: string,
    counter?: number,
    title?: string,
    description?: string,
    anonymous?: boolean,
    channelId?: string,
    lock?: boolean,
}