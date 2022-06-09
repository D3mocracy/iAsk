import { Guild, User } from "discord.js"
import { ObjectId } from "mongodb"

export type Question = {
    started?: boolean,
    lang: string,
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

export type ManagementDetails = {
    managerId: string,
    status: string,
    channelId: string,
}

export type Action = {
    managerId: string,
    memberId: string,
    guildId?: string,
}

export type Note = {
    managerId: string,
    memberId: string,
    guildId: string,
    content?: string,
    deleted: boolean,
    _id?: ObjectId,
}

export type ManageMSG = {
    managerId: string,
    memberId: string,
    guildId: string,
    content?: string,
    sent: boolean,
    deleted: boolean,
    _id?: boolean,
}

export type SetupConfig = {
    guildId: string,
    language: string,
    done: boolean,
    questionCatagory: string,
    manageToolLogChannelID: string,
    questionLogChannelID: string,
    notificationRoleID: string,
    memberRoleID: string,
    trustedRoleID: string,
    supervisorRoleID: string,
    managerRoleID: string,
    maxQuestions: number,
}