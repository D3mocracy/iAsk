import { Client, Guild, GuildMember, User } from "discord.js";

namespace Utils {
    export function commonGuilds(bot: Client, user: User) {
        return bot.guilds.cache.filter((g: Guild) => !!g.members.cache.find((m: GuildMember) => m.id === user.id));
    }

}

export default Utils;