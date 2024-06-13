import { EmbedBuilder, ApplicationCommandOptionType, ChannelType } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["setup"];
  public description = "Setup channel song request";
  public category = "Utils";
  public accessableby = [Accessableby.Manager];
  public usage = "<create> or <delete>";
  public aliases = ["setup"];
  public lavalink = false;
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public permissions = [];

  options = [
    {
      name: "type",
      description: "Type of channel",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "Create",
          value: "create",
        },
        {
          name: "Delete",
          value: "delete",
        },
      ],
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();
    let option = ["create", "delete"];

    if (!handler.args[0] || !option.includes(handler.args[0]))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "error", "arg_error", {
                text: "**create** or **delete**!",
                icon_warning: client.config.emojis.PLAYER.warning
              })}`
            )
            .setColor(client.color),
        ],
      });

    const value = handler.args[0];

    if (value === "create") {
      const SetupChannel = await client.db.setup.get(`${handler.guild!.id}`);

      if (SetupChannel && SetupChannel!.enable == true)
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(handler.language, "command.utils", "setup_enable")}`
              )
              .setColor(client.color),
          ],
        });

      const textChannel = await handler.guild!.channels.create({
        name: "🎶・song-request",
        type: ChannelType.GuildText,
        topic: `${client.i18n.get(handler.language, "command.utils", "setup_topic")}`,
      });

      const queueEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`${client.i18n.get(handler.language, "event.setup", "setup_content_emptylist")}`)
        .setTitle(
          `${client.i18n.get(handler.language, "event.setup", "setup_content", { songs: "0" })}`
        );

      const playEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setAuthor({
          name: `${client.i18n.get(handler.language, "event.setup", "setup_playembed_author", {
            author: "Remify",
          })}`,
          iconURL: `https://cdn.discordapp.com/avatars/987345021441298516/63fa890b6e1aa51ff0334083dfeafa37.webp?size=128`,
        })
        .setImage(`https://share.creavite.co/7sIbbA5ASiomNQkE.gif`)
        .setDescription(
          `${client.i18n.get(handler.language, "event.setup", "setup_playembed_desc", {
            clientId: client.user?.id ?? "987345021441298516",
          })}`
        )
        .setFooter({
          text: `${client.i18n.get(handler.language, "event.setup", "setup_playembed_footer", {
            prefix: "/",
            maker: "Coby.Hツ#6166",
          })}`,
        });

      const channel_msg = await textChannel.send({
        embeds: [queueEmbed, playEmbed],
        components: [client.filterSwitchDisabled, client.diSwitch, client.diSwitch2, client.diSwitch3],
      });

      const new_data = {
        guild: handler.guild!.id,
        enable: true,
        channel: textChannel.id,
        playmsg: channel_msg.id,
      };

      await client.db.setup.set(`${handler.guild!.id}`, new_data);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "command.utils", "setup_msg", {
            channel: String(textChannel),
          })}`
        )
        .setColor(client.color);
      return handler.editReply({ embeds: [embed] });
    } else if (value === "delete") {
      const SetupChannel = await client.db.setup.get(`${handler.guild!.id}`);

      const embed_none = new EmbedBuilder()
        .setDescription(`${client.i18n.get(handler.language, "command.utils", "setup_null")}`)
        .setColor(client.color);

      if (SetupChannel == null) return handler.editReply({ embeds: [embed_none] });
      if (SetupChannel.enable == false) return handler.editReply({ embeds: [embed_none] });

      const fetchedTextChannel = SetupChannel.channel
        ? await handler.guild!.channels.fetch(SetupChannel.channel).catch(() => {})
        : undefined;

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "command.utils", "setup_deleted", {
            channel: String(fetchedTextChannel),
          })}`
        )
        .setColor(client.color);

      if (fetchedTextChannel) await fetchedTextChannel.delete().catch(() => null);

      await client.db.setup.delete(`${handler.guild!.id}`);

      if (!fetchedTextChannel) {
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${client.i18n.get(handler.language, "command.utils", "setup_null")}`)
              .setColor(client.color),
          ],
        });
      }

      return handler.editReply({ embeds: [embed] });
    }
  }
}