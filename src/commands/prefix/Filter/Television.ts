import { EmbedBuilder, Message } from "discord.js";
import delay from "delay";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand {
  name = "television";
  description = "Turning on television filter";
  category = "Filter";
  usage = "";
  aliases = [];
  lavalink = true;
  accessableby = Accessableby.Member;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const msg = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "filters", "filter_loading", {
              name: "television",
            })}`
          )
          .setColor(client.color),
      ],
    });

    const player = client.manager.players.get(message.guild!.id);
    if (!player)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_player")}`
            )
            .setColor(client.color),
        ],
      });
    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    )
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    const data = {
      guildId: message.guild!.id,
      playerOptions: {
        filters: {
          equalizer: [
            { band: 0, gain: 0 },
            { band: 1, gain: 0 },
            { band: 2, gain: 0 },
            { band: 3, gain: 0 },
            { band: 4, gain: 0 },
            { band: 5, gain: 0 },
            { band: 6, gain: 0 },
            { band: 7, gain: 0.65 },
            { band: 8, gain: 0.65 },
            { band: 9, gain: 0.65 },
            { band: 10, gain: 0.65 },
            { band: 11, gain: 0.65 },
            { band: 12, gain: 0.65 },
            { band: 13, gain: 0.65 },
          ],
        },
      },
    };

    await player["send"](data);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "filters", "filter_on", {
          name: "television",
        })}`
      )
      .setColor(client.color);

    await delay(2000);
    msg.edit({ content: " ", embeds: [embed] });
  }
}
