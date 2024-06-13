import { ButtonInteraction, EmbedBuilder, TextChannel, VoiceBasedChannel } from "discord.js";
import { Manager } from "../../../manager.js";
import { RainlinkPlayer } from "../../../rainlink/main.js";

export class ButtonAutoplay {
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
      if (this.player.data.get("autoplay") === true) {
        this.player.data.set("autoplay", false);
        this.player.data.set("identifier", null);
        this.player.data.set("requester", null);
        this.player.queue.clear();

        const off = new EmbedBuilder()
          .setDescription(
            `${this.client.i18n.get(this.language, "button.music", "autoplay_off", {
              icon_stop: this.client.config.emojis.PLAYER.warning,
            })}`
          )
          .setColor(this.client.color);

        await this.interaction.reply({ content: " ", embeds: [off] });
      } else {
        const identifier = this.player.queue.current!.identifier;

        this.player.data.set("autoplay", true);
        this.player.data.set("identifier", identifier);
        this.player.data.set("requester", this.interaction.user);
        this.player.data.set("source", this.player.queue.current?.source);
        this.player.data.set("author", this.player.queue.current?.author);
        this.player.data.set("title", this.player.queue.current?.title);

        const on = new EmbedBuilder()
          .setDescription(
            `${this.client.i18n.get(this.language, "button.music", "autoplay_on", {
              icon_on: this.client.config.emojis.PLAYER.vink,
            })}`
          )
          .setColor(this.client.color);

        await this.interaction.reply({ content: " ", embeds: [on] });
      }
    }
  }
}
