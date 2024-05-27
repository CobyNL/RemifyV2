import { ButtonInteraction, EmbedBuilder, TextChannel, VoiceBasedChannel } from "discord.js";
import { Manager } from "../../../manager.js";
import { RainlinkPlayer } from "../../../rainlink/main.js";

export class ButtonSave {
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
      const currentTrack = this.player.queue.current;

      if (!currentTrack) {
        await this.interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${this.client.i18n.get(this.language, "player", "no_current_track")}`)
              .setColor(this.client.color),
          ],
        });
        return;
      }

      await this.client.db.playlist.push(`${this.interaction.user.id}.tracks`, {
        title: currentTrack.title,
        uri: currentTrack.uri,
        length: currentTrack.duration,
        thumbnail: currentTrack.artworkUrl,
        author: currentTrack.author,
        requester: currentTrack.requester,
      });

      await this.interaction.user.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.i18n.get(this.language, "player", "track_saved", {
                title: currentTrack.title,
              })}`
            )
            .setColor(this.client.color),
        ],
      });

      await this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${this.client.i18n.get(this.language, "player", "saved")}`)
            .setColor(this.client.color),
        ],
      });
    }
  }
}
