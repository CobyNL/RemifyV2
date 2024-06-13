import { ButtonInteraction, EmbedBuilder, TextChannel, VoiceBasedChannel } from "discord.js";
import { Manager } from "../../../manager.js";
import { RainlinkPlayer } from "../../../rainlink/main.js";

export class ButtonMute {
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
            .setDescription(`${this.client.i18n.get(this.language, "error", "no_in_voice", {
              icon_warning: this.client.config.emojis.PLAYER.warning
            })}`)
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
            .setDescription(`${this.client.i18n.get(this.language, "error", "no_same_voice", {
              icon_warning: this.client.config.emojis.PLAYER.warning
            })}`)
            .setColor(this.client.color),
        ],
      });
      return;
    } else if (!this.player) {
      this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${this.client.i18n.get(this.language, "error", "no_player", {
              icon_warning: this.client.config.emojis.PLAYER.warning
            })}`)
            .setColor(this.client.color),
        ],
      });
      return;
    } else {
      const newMuteState = !this.player.mute;
      this.player.setMute(newMuteState);

      const volume = newMuteState
        ? this.player.mute
          ? this.player.volume
          : 100
        : this.client.config.player.DEFAULT_VOLUME || 50;

      await this.player.setVolume(volume);

      const stateString = this.player.mute ? "Muted" : "Unmuted";
      const muteEmoji = this.client.config.emojis.PLAYER.mute;
      const description = this.client.i18n.get(this.language, "button.music", "mute_msg", {
        state: stateString,
        icon_mute: muteEmoji,
      });

      await this.interaction.reply({
        embeds: [new EmbedBuilder().setDescription(description).setColor(this.client.color)],
      });
    }
  }
}