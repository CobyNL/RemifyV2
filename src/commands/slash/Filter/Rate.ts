import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { EmbedBuilder, ApplicationCommandOptionType } from "discord.js";
import delay from "delay";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["filter", "rate"];
  description = "Sets the rate of the song.";
  category = "Filter";
  lavalink = true;
  accessableby = Accessableby.Member;
  options = [
    {
      name: "amount",
      description: "The amount of rate to set.",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ];

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });

    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getInteger("amount");

    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return interaction.editReply({
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
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    if (value! < 0)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "filters", "filter_greater")}`
            )
            .setColor(client.color),
        ],
      });
    if (value! > 10)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "filters", "filter_less")}`
            )
            .setColor(client.color),
        ],
      });

    const data = {
      guildId: interaction.guild!.id,
      playerOptions: {
        filters: {
          timescale: { rate: Number(value) },
        },
      },
    };

    await player.send(data);

    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "filters", "rate_loading", {
              amount: String(value),
            })}`
          )
          .setColor(client.color),
      ],
    });
    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "filters", "rate_on", {
          amount: String(value),
        })}`
      )
      .setColor(client.color);
    await delay(2000);
    msg.edit({ content: " ", embeds: [embed] });
  }
}
