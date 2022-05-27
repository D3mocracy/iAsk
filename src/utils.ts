import { Client, Guild, GuildMember, Intents, User } from "discord.js";
import DataBase from "./db";
import SetupHanlder from "./handlers/setup";

namespace Utils {
    export function commonGuildss(bot: Client, user: User) {
        return bot.guilds.cache.filter((g: Guild) => !!g.members.cache.find((m: GuildMember) => m.id === user.id));
    }

    export async function commonGuildCheck(bot: Client, ...users: User[]) {
        const doneGuildsID = await DataBase.configCollection.find({ done: true }).toArray();
        const guildList: Guild[] = bot.guilds.cache.map(g => g);

        const newlist: Guild[] = guildList.filter(g => {
            const commonUsers = g.members.cache.filter(m => {
                return users.includes(m.user);
            })
            return commonUsers.size === users.length;
        }).filter(g => {
            return !!doneGuildsID.find(d => {
                return d.guildId === g.id;
            });
        });
        return newlist;
    }

    export function convertIDToGuild(bot: Client, guildId: string) {
        return bot.guilds.cache.get(guildId);
    }

    export function convertIDtoUser(bot: Client, userId: string) {
        return bot.users.cache.get(userId);
    }

    export function convertIDtoMemberFromGuild(bot: Client, memberId: string, guildId: string) {
        const guild = bot.guilds.cache.get(guildId);
        if (!guild) return;
        return guild.members.cache.get(memberId);
    }

}

export default Utils;