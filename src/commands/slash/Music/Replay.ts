import { CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { Manager } from "../../../manager.js";
import {
  Accessableby,
  CommandOptionInterface,
  SlashCommand,
} from "../../../@types/Command.js";

// Main code
export default class implements SlashCommand {
  name = ["replay"];
  description = "Replay the current song!";
  category = "Music";
  accessableby = Accessableby.Member;
  lavalink = true;
  options = [];
  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });
    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "replay_loading")}`
          )
          .setColor(client.color),
      ],
    });

    const player = client.manager.players.get(interaction.guild!.id);
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
    const { channel } = (interaction.member as GuildMember)!.voice;
    if (
      !channel ||
      (interaction.member as GuildMember)!.voice.channel !==
        interaction.guild!.members.me!.voice.channel
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

    await player["send"]({
      op: "seek",
      guildId: interaction.guild!.id,
      position: 0,
    });

    const embed = new EmbedBuilder()
      .setDescription(`${client.i18n.get(language, "music", "replay_msg")}`)
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [embed] });
  }
}
