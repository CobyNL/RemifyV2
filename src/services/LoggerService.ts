import { createLogger, transports, format, Logger } from "winston";
import chalk from "chalk";
import util from "node:util";
import { Manager } from "../manager.js";
import { EmbedBuilder, TextChannel } from "discord.js";

type InfoDataType = {
  message: string;
  level: string;
  timestamp?: string;
};

enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
  WEBSOCKET = "websocket",
  LAVALINK = "lavalink",
  LOADER = "loader",
  SETUP = "setup",
  DEPLOY = "deploy",
  UNHANDLED = "unhandled",
}

export class LoggerService {
  private preLog: Logger;
  private padding = 28;
  private discordLogQueue: { type: LogLevel; message: string; className: string }[] = [];
  private discordLogInterval: NodeJS.Timeout | null = null;

  constructor(
    private client: Manager,
    private tag: number
  ) {
    this.preLog = createLogger({
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        websocket: 3,
        lavalink: 4,
        loader: 5,
        setup: 6,
        deploy: 7,
        debug: 8,
        unhandled: 9,
      },
      transports: [
        new transports.Console({
          level: "unhandled",
          format: this.consoleFormat,
        }),
        new transports.File({
          level: "unhandled",
          filename: "./logs/byteblaze.log",
          format: this.fileFormat,
          maxsize: 10485760, // 10MB
          maxFiles: 5,
          tailable: true,
        }),
      ],
    });
    this.discordLogInterval = setInterval(() => {
      this.sendDiscordLogs();
    }, 5000);
  }

  public info(className: string, msg: string) {
    this.log(LogLevel.INFO, className, msg);
  }

  public debug(className: string, msg: string) {
    this.log(LogLevel.DEBUG, className, msg);
  }

  public warn(className: string, msg: string) {
    this.log(LogLevel.WARN, className, msg);
  }

  public error(className: string, msg: unknown) {
    this.log(LogLevel.ERROR, className, util.inspect(msg));
  }

  public lavalink(className: string, msg: string) {
    this.log(LogLevel.LAVALINK, className, msg);
  }

  public loader(className: string, msg: string) {
    this.log(LogLevel.LOADER, className, msg);
  }

  public setup(className: string, msg: string) {
    this.log(LogLevel.SETUP, className, msg);
  }

  public websocket(className: string, msg: string) {
    this.log(LogLevel.WEBSOCKET, className, msg);
  }

  public deploy(className: string, msg: string) {
    this.log(LogLevel.DEPLOY, className, msg);
  }

  public unhandled(className: string, msg: unknown) {
    this.log(LogLevel.UNHANDLED, className, util.inspect(msg));
  }

  private log(level: LogLevel, className: string, msg: string) {
    this.preLog.log({
      level,
      message: `${className.padEnd(this.padding)} | ${msg}`,
    });
    this.queueDiscordLog(level, msg, className);
  }

  private filter(info: InfoDataType) {
    const pad = 9;
    const colors: { [key in LogLevel]: string } = {
      [LogLevel.INFO]: "#00CFF0",
      [LogLevel.DEBUG]: "#F5A900",
      [LogLevel.WARN]: "#FBEC5D",
      [LogLevel.ERROR]: "#e12885",
      [LogLevel.LAVALINK]: "#ffc61c",
      [LogLevel.LOADER]: "#4402f7",
      [LogLevel.SETUP]: "#f7f702",
      [LogLevel.WEBSOCKET]: "#00D100",
      [LogLevel.DEPLOY]: "#7289da",
      [LogLevel.UNHANDLED]: "#ff0000",
    };
    return chalk.hex(colors[info.level as LogLevel])(info.level.toUpperCase().padEnd(pad));
  }

  private get consoleFormat() {
    const colored = chalk.hex("#555554")("|");
    const timeStamp = (info: InfoDataType) =>
      chalk.hex("#555554")(
        `[${new Date(info.timestamp!).toLocaleDateString("en-GB")}] [${new Date(info.timestamp!).toLocaleTimeString("en-GB")}]`
      );
    const botTag = chalk.hex("#ffffff")(`bot_${this.tag}`);
    const msg = (info: InfoDataType) => chalk.hex("#ffffff")(info.message);
    return format.combine(
      format.timestamp(),
      format.printf((info: InfoDataType) => {
        return `${timeStamp(info)} ${colored} ${botTag} ${colored} ${this.filter(info)} ${colored} ${msg(info)}`;
      })
    );
  }

  private get fileFormat() {
    return format.combine(
      format.timestamp(),
      format.printf((info: InfoDataType) => {
        return `[${new Date(info.timestamp!).toLocaleDateString("en-GB")}] [${new Date(info.timestamp!).toLocaleTimeString("en-GB")}] ${info.level.toUpperCase()} | ${info.message}`;
      })
    );
  }

  private queueDiscordLog(type: LogLevel, message: string, className: string) {
    if (
      !this.client.config.utilities.LOG_EVERYTHING &&
      type !== LogLevel.ERROR &&
      type !== LogLevel.WARN &&
      type !== LogLevel.UNHANDLED &&
      type !== LogLevel.DEBUG
    ) {
      return;
    }

    this.discordLogQueue.push({ type, message, className });
  }

  private async sendDiscordLogs() {
    if (this.discordLogQueue.length === 0) return;

    const logBatch = this.discordLogQueue;
    this.discordLogQueue = [];

    try {
      const channel = (await this.client.channels
        .fetch(this.client.config.utilities.LOG_CHANNEL)
        .catch(() => undefined)) as TextChannel;

      if (!channel?.isTextBased()) return;

      const logMessages: { [key in LogLevel]: string[] } = {
        [LogLevel.ERROR]: [],
        [LogLevel.WARN]: [],
        [LogLevel.INFO]: [],
        [LogLevel.DEBUG]: [],
        [LogLevel.WEBSOCKET]: [],
        [LogLevel.LAVALINK]: [],
        [LogLevel.LOADER]: [],
        [LogLevel.SETUP]: [],
        [LogLevel.DEPLOY]: [],
        [LogLevel.UNHANDLED]: [],
      };

      for (const { type, message, className } of logBatch) {
        if (
          !this.client.config.utilities.LOG_EVERYTHING &&
          type !== LogLevel.ERROR &&
          type !== LogLevel.WARN &&
          type !== LogLevel.UNHANDLED &&
          type !== LogLevel.DEBUG
        ) {
          continue;
        }

        logMessages[type].push(`[${className}][bot_${this.tag}] >\n・${message} `);
      }

      const embeds: EmbedBuilder[] = [];

      for (const [type, messages] of Object.entries(logMessages)) {
        if (messages.length > 0) {
          const combinedMessage = messages.join("\n");
          if (combinedMessage.length > 4096) {
            const chunks = combinedMessage.match(/[\s\S]{1,4096}/g) || [];
            for (const chunk of chunks) {
              embeds.push(
                new EmbedBuilder()
                  .setTitle(`${type.charAt(0).toUpperCase() + type.slice(1)} Logs`)
                  .setDescription(`\`\`\`\n${chunk}\n\`\`\``)
                  .setColor(this.client.color)
              );
            }
          } else {
            embeds.push(
              new EmbedBuilder()
                .setTitle(`${type.charAt(0).toUpperCase() + type.slice(1)} Logs`)
                .setDescription(`\`\`\`\n${combinedMessage}\n\`\`\``)
                .setColor(this.client.color)
            );
          }
        }
      }

      for (const embed of embeds) {
        await channel.send({ embeds: [embed] });
      }
    } catch (err) {
      console.error("Failed to send Discord logs:", err);
    }
  }
}
