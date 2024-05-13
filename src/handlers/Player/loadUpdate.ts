import { Manager } from "../../manager.js";
import { EmbedBuilder, TextChannel } from "discord.js";
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { RainlinkPlayer, RainlinkTrack } from "../../rainlink/main.js";

export class playerLoadUpdate {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.loader(this.client);
  }

  async loader(client: Manager) {
    client.UpdateQueueMsg = async function (player: RainlinkPlayer) {
      let data = await client.db.setup.get(`${player.guildId}`);
      if (!data) return;
      if (data.enable === false) return;

      let channel = (await client.channels.fetch(data.channel).catch(() => undefined)) as TextChannel;
      if (!channel) return;

      let playMsg = await channel.messages.fetch(data.playmsg).catch(() => undefined);
      if (!playMsg) return;

      let guildModel = await client.db.language.get(`${player.guildId}`);
      if (!guildModel) {
        guildModel = await client.db.language.set(`${player.guildId}`, client.config.bot.LANGUAGE);
      }

      const language = guildModel;

      const songStrings = [];
      const queuedSongs = player.queue.map(
        (song, i) =>
          `${client.getString(language, "event.setup", "setup_content_queue", {
            index: `${i + 1}`,
            title: song.title,
            duration: new FormatDuration().parse(song.duration),
            request: `${song.requester}`,
          })}`
      );

      await songStrings.push(...queuedSongs);

      const Str = songStrings.slice(0, 10).join("\n");

      const TotalDuration = player.queue.duration;

      let cSong = player.queue.current;
      let qDuration = `${new FormatDuration().parse(TotalDuration + Number(player.queue.current?.duration))}`;
      let songsInQueue = player.queue.size > 11 ? player.queue.size - 10 : "Geen";

      function getTitle(tracks: RainlinkTrack): string {
        if (client.config.lavalink.AVOID_SUSPEND) return tracks.title;
        else {
          return `[${tracks.title}](${tracks.uri})`;
        }
      }

      let embedqueue = new EmbedBuilder()
        .setColor(client.color)
        .setTitle(
          `${client.i18n.get(language, "event.setup", "setup_content", { songs: player.queue.size.toString() })}`
        )
        .setDescription(
          `${Str == "" ? `${client.i18n.get(language, "event.setup", "setup_content_emptylist")}` : "\n" + Str}`
        )
        .setFooter({
          text: `${client.i18n.get(language, "event.setup", "setup_content_queue_footer", {
            songs: songsInQueue.toString(),
          })}`,
        });

      let embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.getString(language, "event.setup", "setup_author")}`,
          iconURL: `${client.getString(language, "event.setup", "setup_author_icon")}`,
        })
        .setDescription(
          `${client.getString(language, "event.setup", "setup_desc", {
            title: getTitle(cSong!),
            url: cSong!.uri ?? "",
            duration: new FormatDuration().parse(cSong!.duration),
            request: `${cSong!.requester}`,
          })}`
        ) // [${cSong.title}](${cSong.uri}) \`[${formatDuration(cSong.duration)}]\` • ${cSong.requester}
        .setColor(client.color)
        .setImage(`${cSong!.artworkUrl ? cSong!.artworkUrl : `https://share.creavite.co/7sIbbA5ASiomNQkE.gif`}`)
        .setFooter({
          text: `${client.getString(language, "event.setup", "setup_footer", {
            songs: player.queue.size.toString(),
            volume: `${Math.floor(player.volume)}`,
            duration: qDuration,
          })}`,
        }); //Volume • ${player.volume}% | Total Duration • ${qDuration}

      return await playMsg
        .edit({
          embeds: [embedqueue, embed],
          components: [client.enSwitchMod, client.enSwitch2],
        })
        .catch((e) => {});
    };

    /**
     *
     * @param {Player} player
     */
    client.UpdateMusic = async function (player: RainlinkPlayer) {
      let data = await client.db.setup.get(`${player.guildId}`);
      if (!data) return;
      if (data.enable === false) return;

      let channel = (await client.channels.fetch(data.channel).catch(() => undefined)) as TextChannel;
      if (!channel) return;

      let playMsg = await channel.messages.fetch(data.playmsg).catch(() => undefined);
      if (!playMsg) return;

      let guildModel = await client.db.language.get(`${player.guildId}`);
      if (!guildModel) {
        guildModel = await client.db.language.set(`${player.guildId}`, client.config.bot.LANGUAGE);
      }

      const language = guildModel;

      const queueEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`${client.i18n.get(language, "event.setup", "setup_content_emptylist")}`)
        .setTitle(
          `${client.i18n.get(language, "event.setup", "setup_content", { songs: player.queue.size.toString() })}`
        );

      const playEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setAuthor({
          name: `${client.getString(language, "event.setup", "setup_playembed_author")}`,
        })
        .setImage(`https://share.creavite.co/7sIbbA5ASiomNQkE.gif`);

      return await playMsg
        .edit({
          embeds: [queueEmbed, playEmbed],
          components: [client.diSwitch, client.diSwitch2],
        })
        .catch((e) => {});
    };
  }
}
