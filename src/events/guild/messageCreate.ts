import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Message,
  PermissionFlagsBits,
} from "discord.js";
import { Manager } from "../../manager.js";
import { EmbedBuilder } from "discord.js";
import { stripIndents } from "common-tags";
import fs from "fs";
import {
  CheckPermissionResultInterface,
  CheckPermissionServices,
} from "../../services/CheckPermissionService.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Accessableby } from "../../structures/Command.js";
import { RatelimitReplyService } from "../../services/RatelimitReplyService.js";
import { RateLimitManager } from "@sapphire/ratelimits";
import { TopggServiceEnum } from "../../services/TopggService.js";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
const commandRateLimitManager = new RateLimitManager(1000);

export default class {
  async execute(client: Manager, message: Message) {
    if (message.author.bot || message.channel.type == ChannelType.DM) return;

    if (!client.isDatabaseConnected)
      return client.logger.warn(
        "DatabaseService",
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    let guildModel = await client.db.language.get(`${message.guild!.id}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(`${message.guild!.id}`, client.config.bot.LANGUAGE);
    }

    const language = guildModel;

    let PREFIX = client.prefix;

    const mention = new RegExp(`^<@!?${client.user!.id}>( |)$`);

    const GuildPrefix = await client.db.prefix.get(`${message.guild!.id}`);
    if (GuildPrefix) PREFIX = GuildPrefix;
    else if (!GuildPrefix)
      PREFIX = String(await client.db.prefix.set(`${message.guild!.id}`, client.prefix));

    if (message.content.match(mention)) {
      const mention_embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(language, "event.message", "wel", {
            bot: message.guild!.members.me!.displayName,
          })}`,
        })
        .setColor(client.color).setDescription(stripIndents`
          ${client.i18n.get(language, "event.message", "intro1", {
            bot: message.guild!.members.me!.displayName,
          })}
          ${client.i18n.get(language, "event.message", "intro2")}
          ${client.i18n.get(language, "event.message", "intro3")}
          ${client.i18n.get(language, "event.message", "prefix", {
            prefix: `\`${PREFIX}\` or \`/\``,
          })}
          ${client.i18n.get(language, "event.message", "help1", {
            help: `\`${PREFIX}help\` or \`/help\``,
          })}
          ${client.i18n.get(language, "event.message", "help2", {
            botinfo: `\`${PREFIX}status\` or \`/status\``,
          })}
          ${client.i18n.get(language, "event.message", "ver", {
            botver: client.metadata.version,
          })}
          ${client.i18n.get(language, "event.message", "djs", {
            djsver: JSON.parse(await fs.readFileSync("package.json", "utf-8")).dependencies[
              "discord.js"
            ],
          })}
          ${client.i18n.get(language, "event.message", "lavalink", {
            aver: client.metadata.autofix,
          })}
          ${client.i18n.get(language, "event.message", "codename", {
            codename: client.metadata.codename,
          })}
          `);
      await message.reply({ embeds: [mention_embed] });
      return;
    }
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixRegex = new RegExp(`^(<@!?${client.user!.id}>|${escapeRegex(PREFIX)})\\s*`);
    if (!prefixRegex.test(message.content)) return;
    const [matchedPrefix] = message.content.match(prefixRegex) as RegExpMatchArray;
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
    const cmd = args.shift()!.toLowerCase();

    const command =
      client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd) as string);
    if (!command) return;

    const setup = await client.db.setup.get(String(message.guildId));

    if (setup && setup.channel == message.channelId) return;

    //////////////////////////////// Ratelimit check start ////////////////////////////////
    const ratelimit = commandRateLimitManager.acquire(
      `${message.author.id}@${command.name.join("-")}`
    );

    if (ratelimit.limited) {
      new RatelimitReplyService({
        client: client,
        language: language,
        message: message,
        time: Number(((ratelimit.expires - Date.now()) / 1000).toFixed(1)),
      }).reply();
      return;
    }

    ratelimit.consume();
    //////////////////////////////// Ratelimit check end ////////////////////////////////

    //////////////////////////////// Permission check start ////////////////////////////////
    const permissionChecker = new CheckPermissionServices();

    //Default permission
    const defaultPermissions = [
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.ReadMessageHistory,
    ];
    const allCommandPermissions = [PermissionFlagsBits.ManageMessages];
    const musicPermissions = [PermissionFlagsBits.Speak, PermissionFlagsBits.Connect];
    const managePermissions = [PermissionFlagsBits.ManageChannels];

    async function respondError(permissionResult: CheckPermissionResultInterface) {
      const selfErrorString = `${client.i18n.get(language, "error", "no_perms", {
        perm: permissionResult.result,
        icon_warning: client.config.emojis.PLAYER.warning,
      })}`;
      const embed = new EmbedBuilder()
        .setDescription(
          permissionResult.channel == "Self"
            ? selfErrorString
            : `${client.i18n.get(language, "error", "no_perms_channel", {
                perm: permissionResult.result,
                channel: permissionResult.channel,
                icon_warning: client.config.emojis.PLAYER.warning,
              })}`
        )
        .setColor(client.color);
      const dmChannel =
        message.author.dmChannel == null
          ? await message.author.createDM()
          : message.author.dmChannel;
      dmChannel
        .send({
          embeds: [embed],
        })
        .catch(async () => {
          await message.reply({ embeds: [embed] }).catch(() => null);
        });
    }

    const returnData = await permissionChecker.message(message, defaultPermissions);
    if (returnData.result !== "PermissionPass") return respondError(returnData);

    if (command.accessableby.includes(Accessableby.Manager)) {
      const returnData = await permissionChecker.message(message, managePermissions);
      if (returnData.result !== "PermissionPass") return respondError(returnData);
    } else if (command.category == "Music") {
      const returnData = await permissionChecker.message(message, musicPermissions);
      if (returnData.result !== "PermissionPass") return respondError(returnData);
    } else if (command.name.join("-") !== "help") {
      const returnData = await permissionChecker.message(message, allCommandPermissions);
      if (returnData.result !== "PermissionPass") return respondError(returnData);
    } else if (command.permissions.length !== 0) {
      const returnData = await permissionChecker.message(message, command.permissions);
      if (returnData.result !== "PermissionPass") return respondError(returnData);
    }
    //////////////////////////////// Permission check end ////////////////////////////////

    //////////////////////////////// Check avalibility start ////////////////////////////////
    if (command.lavalink && client.lavalinkUsing.length == 0) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "error", "no_node", {
                icon_warning: client.config.emojis.PLAYER.warning,
              })}`
            )
            .setColor(client.color),
        ],
      });
    }

    if (command.playerCheck) {
      const player = client.rainlink.players.get(message.guild!.id);
      const twentyFourBuilder = new AutoReconnectBuilderService(client);
      const is247 = await twentyFourBuilder.get(message.guild!.id);
      if (
        !player ||
        (is247 && is247.twentyfourseven && player.queue.length == 0 && !player.queue.current)
      )
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "error", "no_player", {
                  icon_warning: client.config.emojis.PLAYER.warning,
                })}`
              )
              .setColor(client.color),
          ],
        });
    }

    if (command.sameVoiceCheck) {
      const { channel } = message.member!.voice;
      if (!channel || message.member!.voice.channel !== message.guild!.members.me!.voice.channel)
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "error", "no_voice", {
                  icon_warning: client.config.emojis.PLAYER.warning,
                })}`
              )
              .setColor(client.color),
          ],
        });
    }

    if (
      command.accessableby.includes(Accessableby.Manager) &&
      !message.member!.permissions.has(PermissionFlagsBits.ManageGuild)
    )
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "error", "no_perms", {
                perm: "ManageGuild",
                icon_warning: client.config.emojis.PLAYER.warning,
              })}`
            )
            .setColor(client.color),
        ],
      });
    //////////////////////////////// Check avalibility end ////////////////////////////////

    //////////////////////////////// Check accessibility start ////////////////////////////////
    const premiumUser = await client.db.premium.get(message.author.id);
    const premiumGuild = await client.db.preGuild.get(String(message.guild?.id));
    const isPremium = (premiumUser && premiumUser.isPremium) ?? false;
    const isPremiumGuild = (premiumGuild && premiumGuild.isPremium) ?? false;
    const isOwner = message.author.id == client.owner;
    const isAdmin = client.config.bot.ADMIN.includes(message.author.id);
    const userPerm = {
      owner: isOwner,
      admin: isOwner || isAdmin,
      premium: isOwner || isAdmin || isPremium,
      guildPre: isOwner || isAdmin || isPremium || isPremiumGuild,
    };

    if (command.accessableby.includes(Accessableby.Owner) && !userPerm.owner)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "error", "owner_only", {
                icon_warning: client.config.emojis.PLAYER.warning,
              })}`
            )
            .setColor(client.color),
        ],
      });

    if (command.accessableby.includes(Accessableby.Admin) && !userPerm.admin)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "error", "no_perms", {
                perm: "dreamvast@admin",
                icon_warning: client.config.emojis.PLAYER.warning,
              })}`
            )
            .setColor(client.color),
        ],
      });

    if (command.accessableby.includes(Accessableby.Premium) && !userPerm.premium) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(language, "error", "no_premium_author", {
            icon_warning: client.config.emojis.PLAYER.warning,
          })}`,
          iconURL: client.user!.displayAvatarURL(),
        })
        .setDescription(
          `${client.i18n.get(language, "error", "no_premium_desc", {
            icon_warning: client.config.emojis.PLAYER.warning,
          })}`
        )
        .setColor(client.color)
        .setTimestamp();
      return message.reply({ content: " ", embeds: [embed] });
    }

    if (command.accessableby.includes(Accessableby.GuildPremium) && !userPerm.guildPre) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(language, "error", "no_premium_author", {
            icon_warning: client.config.emojis.PLAYER.warning,
          })}`,
          iconURL: client.user!.displayAvatarURL(),
        })
        .setDescription(
          `${client.i18n.get(language, "error", "no_guild_premium_desc", {
            icon_warning: client.config.emojis.PLAYER.warning,
          })}`
        )
        .setColor(client.color)
        .setTimestamp();
      return message.reply({
        content: " ",
        embeds: [embed],
      });
    }

    const isNotPassAll = Object.values(userPerm).some((data) => data === false);

    if (command.accessableby.includes(Accessableby.Voter) && client.topgg && isNotPassAll) {
      const voteChecker = await client.topgg.checkVote(message.author.id);
      if (voteChecker == TopggServiceEnum.ERROR) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: client.i18n.get(language, "error", "topgg_error_author", {
              icon_warning: client.config.emojis.PLAYER.warning,
            }),
          })
          .setDescription(
            client.i18n.get(language, "error", "topgg_error_desc", {
              icon_warning: client.config.emojis.PLAYER.warning,
            })
          )
          .setColor(client.color)
          .setTimestamp();
        return message.reply({ content: " ", embeds: [embed] });
      }

      if (voteChecker == TopggServiceEnum.UNVOTED) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: client.i18n.get(language, "error", "topgg_vote_author", {
              icon_warning: client.config.emojis.PLAYER.warning,
            }),
          })
          .setDescription(
            client.i18n.get(language, "error", "topgg_vote_desc", {
              icon_warning: client.config.emojis.PLAYER.warning,
            })
          )
          .setColor(client.color)
          .setTimestamp();
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel(
              client.i18n.get(language, "error", "topgg_vote_button", {
                icon_warning: client.config.emojis.PLAYER.warning,
              })
            )
            .setStyle(ButtonStyle.Link)
            .setURL(`https://top.gg/bot/${client.user?.id}/vote`)
        );
        return message.reply({ content: " ", embeds: [embed], components: [row] });
      }
    }
    //////////////////////////////// Check accessibility end ////////////////////////////////

    try {
      const handler = new CommandHandler({
        message: message,
        language: language,
        client: client,
        args: args,
        prefix: PREFIX || client.prefix || "d!",
      });

      if (message.attachments.size !== 0) handler.addAttachment(message.attachments);

      client.logger.info(
        "CommandManager | Message",
        `[${command.name.join("-")}] used by ${message.author.username} from ${message.guild?.name} (${
          message.guild?.id
        })`
      );

      command.execute(client, handler);
    } catch (error) {
      client.logger.error("CommandManager | Message", error);
      message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "error", "unexpected_error", {
                icon_warning: client.config.emojis.PLAYER.warning,
              })}\n ${error}`
            )
            .setColor(client.color),
        ],
      });
    }
  }
}
