import { ButtonInteraction, EmbedBuilder, TextChannel, VoiceBasedChannel } from "discord.js";
import { Manager } from "../../../manager.js";
import { RainlinkPlayer } from "../../../rainlink/main.js";

export class ButtonDelete {
  client: Manager;
  interaction: ButtonInteraction;
  channel: VoiceBasedChannel | null;
  language: string;
  player: RainlinkPlayer;
  constructor(
    client: Manager,
    interaction: ButtonInteraction,
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
      if (this.player.queue.length > 0) {
        this.player.queue.clear();
        this.interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${this.client.i18n.get(this.language, "button.music", "clear_msg", {
                  icon_clear: this.client.config.emojis.PLAYER.delete,
                })}`
              )
              .setColor(this.client.color),
          ],
        });
        await this.client.UpdateQueueMsg(this.player);
      } else {
        this.interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${this.client.i18n.get(this.language, "button.music", "clear_empty", {
                  icon_warning: this.client.config.emojis.PLAYER.warning,
                })}`
              )
              .setColor(this.client.color),
          ],
        });
      }
    }
  }
}
