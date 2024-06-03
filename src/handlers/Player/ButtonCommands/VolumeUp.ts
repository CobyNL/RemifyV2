import { ButtonInteraction, EmbedBuilder, VoiceBasedChannel } from "discord.js";
import { Manager } from "../../../manager.js";
import { RainlinkPlayer } from "../../../rainlink/main.js";

export class ButtonVolumeUp {
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
            .setDescription(`${this.client.i18n.get(this.language, "error", "no_in_voice")}`)
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
            .setDescription(`${this.client.i18n.get(this.language, "error", "no_same_voice")}`)
            .setColor(this.client.color),
        ],
      });
      return;
    } else if (!this.player) {
      this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${this.client.i18n.get(this.language, "error", "no_player")}`)
            .setColor(this.client.color),
        ],
      });
      return;
    } else {
      let newVolume = this.player.volume + 10;
      if (newVolume > 100) {
        newVolume = 100;
        await this.interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${this.client.i18n.get(this.language, "button.music", "volume_max")}`)
              .setColor(this.client.color),
          ],
        });
      } else {
        await this.player.setVolume(newVolume);
        await this.interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${this.client.i18n.get(this.language, "button.music", "volume_up", {
                  volume: newVolume.toString(),
                })}`
              )
              .setColor(this.client.color),
          ],
        });
      }
      await this.client.UpdateQueueMsg(this.player);
    }
  }
}