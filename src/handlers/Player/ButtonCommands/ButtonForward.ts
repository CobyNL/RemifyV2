import { ButtonInteraction, EmbedBuilder, TextChannel, VoiceBasedChannel } from "discord.js";
import { Manager } from "../../../manager.js";
import { RainlinkPlayer } from "../../../rainlink/main.js";
import { formatDuration } from "../../../utilities/FormatDuration.js";

export class ButtonForward {
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
    await this.interaction.deferReply();
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
      const song = this.player.queue.current;
      const song_position = this.player.position;
      const CurrentDuration = formatDuration(song_position + 10000);

      if (song_position + 10000 < song!.duration!) {
        this.player.send({
          guildId: this.interaction.guild!.id,
          playerOptions: {
            position: song_position + 10000,
          },
        });

        const forward2 = new EmbedBuilder()
          .setDescription(
            `${this.client.i18n.get(this.language, "button.music", "forward_msg", {
              duration: CurrentDuration,
              icon_forward: this.client.config.emojis.PLAYER.arrow_next,
            })}`
          )
          .setColor(this.client.color);

        await this.interaction.editReply({ content: " ", embeds: [forward2] });
      } else {
        return await this.interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${this.client.i18n.get(this.language, "button.music", "forward_beyond", {
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
