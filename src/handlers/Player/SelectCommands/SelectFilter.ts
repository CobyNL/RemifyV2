import {
  ButtonInteraction,
  EmbedBuilder,
  SelectMenuInteraction,
  TextChannel,
  VoiceBasedChannel,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { RainlinkPlayer, RainlinkFilterMode } from "../../../rainlink/main.js";

export class FilterSelect {
  client: Manager;
  interaction: SelectMenuInteraction;
  channel: VoiceBasedChannel | null;
  language: string;
  player: RainlinkPlayer;

  constructor(
    client: Manager,
    interaction: SelectMenuInteraction,
    channel: VoiceBasedChannel | null,
    language: string,
    player: RainlinkPlayer
  ) {
    this.channel = channel;
    this.client = client;
    this.language = language;
    this.player = player;
    this.interaction = interaction;
    this.execute();
  }

  async execute() {
    if (!this.channel) {
      this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.i18n.get(this.language, "error", "no_in_voice", {
                icon_warning: this.client.config.emojis.PLAYER.warning,
              })}`
            )
            .setColor(this.client.color),
        ],
      });
      return;
    } else if (
      this.interaction.guild!.members.me!.voice.channel &&
      !this.interaction.guild!.members.me!.voice.channel.equals(this.channel)
    ) {
      this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.i18n.get(this.language, "error", "no_same_voice", {
                icon_warning: this.client.config.emojis.PLAYER.warning,
              })}`
            )
            .setColor(this.client.color),
        ],
      });
      return;
    } else if (!this.player) {
      this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.i18n.get(this.language, "error", "no_player", {
                icon_warning: this.client.config.emojis.PLAYER.warning,
              })}`
            )
            .setColor(this.client.color),
        ],
      });
      return;
    } else {
      if (this.player.data.get("autoplay") === true) {
        this.player.data.set("autoplay", false);
      }
      this.player.data.set("filter-mode", this.interaction.values[0]);
      this.player.filter.set(this.interaction.values[0] as RainlinkFilterMode);

      const embed = new EmbedBuilder()
        .setDescription(
          `${this.client.i18n.get(this.language, "command.filter", "filter_on", {
            name: this.interaction.values[0],
          })}`
        )
        .setColor(this.client.color);

      this.interaction.reply({ content: " ", embeds: [embed] });
    }
  }
}
