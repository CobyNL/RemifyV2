import { Manager } from "../../manager.js";
import { JSON_MESSAGE } from "../../@types/Websocket.js";
import { RequestInterface } from "../RequestInterface.js";
import WebSocket from "ws";

export default class implements RequestInterface {
  name = "join";
  run = async (client: Manager, json: JSON_MESSAGE, ws: WebSocket) => {
    if (!json.user) return ws.send(JSON.stringify({ error: "0x115", message: "No user's id provided" }));
    if (!json.guild) return ws.send(JSON.stringify({ error: "0x120", message: "No guild's id provided" }));

    const Guild = await client.guilds.fetch(json.guild);
    const Member = await Guild!.members.fetch(json.user);
    const channel =
      Guild!.channels.cache.find((channel) => channel.name === "general") || Guild!.channels.cache.first();

    await client.rainlink.create({
      guildId: Guild!.id,
      voiceId: Member!.voice.channel!.id,
      textId: String(channel?.id),
      shardId: Guild.shardId,
      deaf: true,
      volume: client.config.lavalink.DEFAULT_VOLUME ?? 100,
    });
  };
}
