import { Manager } from "../../manager.js";
import { Setup } from "../schema/Setup.js";
import { EmbedBuilder, TextChannel } from "discord.js";

export class SongRequesterCleanSetup {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.execute();
  }

  async execute() {
    const guilds = await this.client.db.setup.all();

    for (let data of guilds) {
      const extractData = data.value;
      const player = this.client.rainlink.players.get(extractData.guild);
      if (!extractData.enable) return;
      if (player) return;
      await this.restore(extractData);
    }
  }

  async restore(setupData: Setup) {
    let channel = (await this.client.channels
      .fetch(setupData.channel)
      .catch(() => undefined)) as TextChannel;
    if (!channel) return;

    let playMsg = await channel.messages.fetch(setupData.playmsg).catch(() => undefined);
    if (!playMsg) return;

    let guildModel = await this.client.db.language.get(`${setupData.guild}`);
    if (!guildModel) {
      guildModel = await this.client.db.language.set(
        `${setupData.guild}`,
        this.client.config.bot.LANGUAGE
      );
    }

    const language = guildModel;

    const queueEmbed = new EmbedBuilder()
      .setColor(this.client.color)
      .setDescription(`${this.client.i18n.get(language, "event.setup", "setup_content_emptylist")}`)
      .setTitle(
        `${this.client.i18n.get(language, "event.setup", "setup_content", { songs: "0" })}`
      );

    const playEmbed = new EmbedBuilder()
      .setColor(this.client.color)
      .setAuthor({
        name: `${this.client.i18n.get(language, "event.setup", "setup_playembed_author", {
          author: "Remify",
        })}`,
        iconURL: `https://cdn.discordapp.com/avatars/987345021441298516/63fa890b6e1aa51ff0334083dfeafa37.webp?size=128`,
      })
      .setImage(`https://share.creavite.co/7sIbbA5ASiomNQkE.gif`)
      .setDescription(
        `${this.client.i18n.get(language, "event.setup", "setup_playembed_desc", {
          clientId: this.client.user?.id ?? "987345021441298516",
        })}`
      )
      .setFooter({
        text: `${this.client.i18n.get(language, "event.setup", "setup_playembed_footer", {
          prefix: "/",
          maker: "Coby.Hツ#6166",
        })}`,
      });

    return await playMsg
      .edit({
        embeds: [queueEmbed, playEmbed],
        components: [this.client.filterSwitchDisabled, this.client.diSwitch, this.client.diSwitch2, this.client.diSwitch3],
      })
      .catch(() => {});
  }
}