import { Manager } from "../../manager.js";
import { EmbedBuilder, TextChannel } from "discord.js";
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { RainlinkPlayer, RainlinkTrack } from "../../rainlink/main.js";

const youtubeIcon =
  "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/youtube-music-icon.png";
const soundcloudIcon =
  "https://png.pngtree.com/element_our/png/20180827/soundcloud-music-stream-social-media-icon-png_71808.jpg";
const spotifyIcon = "https://i.imgur.com/nC9RLL4.png";

export class PlayerUpdateLoader {
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
            source: getSourceEmoji(song.source),
            request: `${song.requester}`,
          })}`
      );

      await songStrings.push(...queuedSongs);

      const Str = songStrings.slice(0, 10).join("\n");

      const TotalDuration = player.queue.duration;

      let cSong = player.queue.current;
      let qDuration = `${new FormatDuration().parse(TotalDuration + Number(player.queue.current?.duration))}`;
      let songsInQueue = player.queue.size > 11 ? player.queue.size - 10 : "Geen";
      const source = player.queue.current?.source;
      let sourceIcon = "";
      if (source === "youtube") {
        sourceIcon = `${youtubeIcon}`;
      } else if (source === "soundcloud") {
        sourceIcon = `${soundcloudIcon}`;
      } else if (source === "spotify") {
        sourceIcon = `${spotifyIcon}`;
      } else {
        sourceIcon = client.user
          ? client.user.displayAvatarURL()
          : "https://cdn.discordapp.com/avatars/1041773236603596861/63fa890b6e1aa51ff0334083dfeafa37.webp?size=80";
      }

      function getSourceEmoji(source: string): string {
        switch (source) {
          case "youtube":
            return `<:YoutubeMusic:1243364353877606472>`;
          case "soundcloud":
            return `<:Soundcloud:1032048037096341585>`;
          case "spotify":
            return `<:Spotify:988224333128298516>`;
          default:
            return "";
        }
      }

      let embedqueue = new EmbedBuilder()
        .setColor(client.color)
        .setTitle(`${client.i18n.get(language, "event.setup", "setup_content")}`)
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
            title: cSong!.title ?? "",
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
          iconURL: `${sourceIcon}`,
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
          name: `${client.getString(language, "event.setup", "setup_playembed_author", {
            author: "Remify",
          })}`,
          iconURL: `https://cdn.discordapp.com/avatars/1041773236603596861/63fa890b6e1aa51ff0334083dfeafa37.webp?size=80`,
        })
        .setImage(`https://share.creavite.co/7sIbbA5ASiomNQkE.gif`)
        .setDescription(
          `${client.getString(language, "event.setup", "setup_playembed_desc", {
            clientId: client.user?.id ?? "987345021441298516",
          })}`
        )
        .setFooter({
          text: `${client.getString(language, "event.setup", "setup_playembed_footer", {
            prefix: "/",
            maker: "Coby.Hツ#6166",
          })}`,
        });

      return await playMsg
        .edit({
          embeds: [queueEmbed, playEmbed],
          components: [client.diSwitch, client.diSwitch2],
        })
        .catch((e) => {});
    };
  }
}
