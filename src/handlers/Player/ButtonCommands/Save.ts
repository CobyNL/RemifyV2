import {
  ActionRowBuilder,
  ButtonInteraction,
  EmbedBuilder,
  ModalBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
  User,
  VoiceBasedChannel,
} from "discord.js";
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
      const currentTrack = this.player.queue.current;

      if (!currentTrack) {
        await this.interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${this.client.i18n.get(this.language, "button.music", "no_current_track", {
                  icon_warning: this.client.config.emojis.PLAYER.warning,
                })}`
              )
              .setColor(this.client.color),
          ],
        });
        return;
      }

      // Create a modal for the user to choose where to save the track
      const modal = new ModalBuilder().setCustomId("save_track").setTitle(
        this.client.i18n.get(this.language, "button.music", "save_track", {
          icon_save: this.client.config.emojis.PLAYER.save,
        })
      );

      const saveToPlaylistInput = new TextInputBuilder()
        .setCustomId("save_to_playlist")
        .setLabel(
          this.client.i18n.get(this.language, "button.music", "save_to_playlist", {
            icon_playlist: this.client.config.emojis.PLAYER.save,
          })
        )
        .setStyle(TextInputStyle.Short)
        .setPlaceholder(
          this.client.i18n.get(this.language, "button.music", "save_to_playlist_placeholder")
        )
        .setRequired(false);

      const saveToDirectMessageInput = new TextInputBuilder()
        .setCustomId("save_to_dm")
        .setLabel(
          this.client.i18n.get(this.language, "button.music", "save_to_dm", {
            icon_dm: this.client.config.emojis.PLAYER.save,
          })
        )
        .setStyle(TextInputStyle.Short)
        .setPlaceholder(
          this.client.i18n.get(this.language, "button.music", "save_to_dm_placeholder")
        )
        .setRequired(false);

      const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
        saveToPlaylistInput
      );
      const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
        saveToDirectMessageInput
      );

      modal.addComponents(firstActionRow, secondActionRow);

      await this.interaction.showModal(modal);

      const submitted = await this.interaction.awaitModalSubmit({
        filter: (interaction) => interaction.user.id === this.interaction.user.id,
        time: 60000,
      });

      if (submitted) {
        const saveToPlaylist = submitted.fields.getTextInputValue("save_to_playlist");
        const saveToDirectMessage = submitted.fields.getTextInputValue("save_to_dm");

        const embed = new EmbedBuilder()
          .setAuthor({
            name: this.client.i18n.get(this.language, "button.music", "track_saved_author"),
            iconURL: "https://cdn.discordapp.com/emojis/741605543046807626.gif",
          })
          .setDescription(
            this.client.i18n.get(this.language, "button.music", "track_saved_desc", {
              title: currentTrack.title,
              url: currentTrack.uri,
            })
          )
          .setColor(this.client.color)
          .addFields(
            {
              name: this.client.i18n.get(this.language, "button.music", "track_saved_field_name1"),
              value: this.client.i18n.get(
                this.language,
                "button.music",
                "track_saved_field_value1",
                { duration: currentTrack.duration.toString() }
              ),
              inline: true,
            },
            {
              name: this.client.i18n.get(this.language, "button.music", "track_saved_field_name2"),
              value: this.client.i18n.get(
                this.language,
                "button.music",
                "track_saved_field_value2",
                { author: currentTrack.author }
              ),
              inline: true,
            },
            {
              name: this.client.i18n.get(this.language, "button.music", "track_saved_field_name3"),
              value: this.client.i18n.get(
                this.language,
                "button.music",
                "track_saved_field_value3",
                { queue: this.player.queue.length.toString() }
              ),
              inline: true,
            },
            {
              name: this.client.i18n.get(this.language, "button.music", "track_saved_field_name4"),
              value: this.client.i18n.get(
                this.language,
                "button.music",
                "track_saved_field_value4",
                {
                  position: this.player.position.toString(),
                  duration: currentTrack.duration.toString(),
                }
              ),
              inline: true,
            },
            {
              name: this.client.i18n.get(this.language, "button.music", "track_saved_field_name5"),
              value: this.client.i18n.get(
                this.language,
                "button.music",
                "track_saved_field_value5",
                { replay: currentTrack.title }
              ),
              inline: true,
            }
          )
          .setFooter({
            text: this.client.i18n.get(this.language, "button.music", "track_saved_footer", {
              requester: currentTrack.requester.toString(),
              volume: this.player.volume.toString(),
            }),
            iconURL: (currentTrack.requester as User).avatarURL(),
          });

        if (saveToPlaylist) {
          await this.client.db.playlist.push(`${this.interaction.user.id}.tracks`, {
            title: currentTrack.title,
            uri: currentTrack.uri,
            length: currentTrack.duration,
            thumbnail: currentTrack.artworkUrl,
            author: currentTrack.author,
            requester: currentTrack.requester,
          });

          await submitted.reply({
            embeds: [embed],
          });
        }

        if (saveToDirectMessage) {
          await this.interaction.user.send({
            embeds: [embed],
          });

          await submitted.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${this.client.i18n.get(this.language, "button.music", "saved_to_dm", {
                    icon_on: this.client.config.emojis.PLAYER.vink,
                  })}`
                )
                .setColor(this.client.color),
            ],
          });
        }

        if (!saveToPlaylist && !saveToDirectMessage) {
          await submitted.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${this.client.i18n.get(this.language, "button.music", "save_cancelled", {
                    icon_warning: this.client.config.emojis.PLAYER.warning,
                  })}`
                )
                .setColor(this.client.color),
            ],
          });
        }
      } else {
        await this.interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${this.client.i18n.get(this.language, "button.music", "save_cancelled", {
                  icon_warning: this.client.config.emojis.PLAYER.warning,
                })}`
              )
              .setColor(this.client.color),
          ],
          components: [],
        });
      }
    }
  }
}
