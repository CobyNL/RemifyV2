import { EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

// Main code
export default class implements Command {
  public name = ["autoplay"];
  public description = "Autoplay music (Random play songs)";
  public category = "Music";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = [];
  public lavalink = true;
  public options = [];
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public permissions = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.rainlink.players.get(handler.guild!.id);

    if (player!.data.get("autoplay") === true) {
      player!.data.set("autoplay", false);
      player!.data.set("identifier", null);
      player!.data.set("requester", null);
      player!.queue.clear();

      const off = new EmbedBuilder()
        .setDescription(
          `${client.getString(handler.language, "command.music", "autoplay_off", {
            mode: handler.modeLang.disable,
          })}`
        )
        .setColor(client.color);

      await handler.editReply({ content: " ", embeds: [off] });
    } else {
      const identifier = player!.queue.current!.identifier;
      const search = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
      const res = await player!.search(search, { requester: handler.user });

      const finalRes = res.tracks.filter(
        (track) =>
          !player!.queue.some((s) => s.encoded === track.encoded) &&
          !player!.queue.previous.some((s) => s.encoded === track.encoded)
      );

      player!.data.set("autoplay", true);

      player!.data.set("identifier", identifier);

      player!.data.set("requester", handler.user);

      player!.queue.add(finalRes[1]);

      const on = new EmbedBuilder()
        .setDescription(
          `${client.getString(handler.language, "command.music", "autoplay_on", {
            mode: handler.modeLang.enable,
          })}`
        )
        .setColor(client.color);

      await handler.editReply({ content: " ", embeds: [on] });
    }
  }
}
