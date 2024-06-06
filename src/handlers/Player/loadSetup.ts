import { PlayerEmojis } from "./../../@types/Config.js";
import { Manager } from "../../manager.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

/**
 *
 * @param {Client} client
 */

export class PlayerSetupLoader {
  client: Manager;
  icons: PlayerEmojis;
  constructor(client: Manager) {
    this.client = client;
    this.icons = this.client.config.emojis.PLAYER;
    this.registerDisableSwitch();
    this.registerDisableSwitch2();
    this.RegisterDisableSwitch3();
    this.registerEnableSwitch();
    this.RegisterEnableSwitch2();
    this.RegisterEnableSwitch3();
    this.registerEnableSwitchMod();
  }
  registerEnableSwitch() {
    this.client.enSwitch = new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sstop")
        .setEmoji(this.icons.stop),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sprevious")
        .setEmoji(this.icons.previous),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("spause")
        .setEmoji(this.icons.play),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sskip")
        .setEmoji(this.icons.skip),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sloop")
        .setEmoji(this.icons.loop),
    ]);
  }

  RegisterEnableSwitch2() {
    this.client.enSwitch2 = new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("svoldown")
        .setEmoji(this.icons.voldown),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("srewind")
        .setEmoji(this.icons.arrow_previous),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("smute")
        .setEmoji(this.icons.mute),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sforward")
        .setEmoji(this.icons.arrow_next),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("svolup")
        .setEmoji(this.icons.volup),
    ]);
  }

  RegisterEnableSwitch3() {
    this.client.enSwitch3 = new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sautoplay")
        .setEmoji(this.icons.autoplay),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sdelete")
        .setEmoji(this.icons.delete),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("ssave")
        .setEmoji(this.icons.save),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sshuffle")
        .setEmoji(this.icons.shuffle),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sfilterreset")
        .setEmoji(this.icons.filterreset),
    ]);
  }

  registerEnableSwitchMod() {
    this.client.enSwitchMod = new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sstop")
        .setEmoji(this.icons.stop),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sprevious")
        .setEmoji(this.icons.previous),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("spause")
        .setEmoji(this.icons.pause),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sskip")
        .setEmoji(this.icons.skip),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sloop")
        .setEmoji(this.icons.loop),
    ]);
  }

  registerDisableSwitch() {
    this.client.diSwitch = new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sstop")
        .setEmoji(this.icons.stop)
        .setDisabled(true),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sprevious")
        .setEmoji(this.icons.previous)
        .setDisabled(true),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("spause")
        .setEmoji(this.icons.play)
        .setDisabled(true),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sskip")
        .setEmoji(this.icons.skip)
        .setDisabled(true),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sloop")
        .setEmoji(this.icons.loop)
        .setDisabled(true),
    ]);
  }

  registerDisableSwitch2() {
    this.client.diSwitch2 = new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("svoldown")
        .setEmoji(this.icons.voldown)
        .setDisabled(true),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("srewind")
        .setEmoji(this.icons.arrow_previous)
        .setDisabled(true),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("smute")
        .setEmoji(this.icons.mute)
        .setDisabled(true),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sforward")
        .setEmoji(this.icons.arrow_next)
        .setDisabled(true),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("svolup")
        .setEmoji(this.icons.volup)
        .setDisabled(true),
    ]);
  }

  RegisterDisableSwitch3() {
    this.client.diSwitch3 = new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sautoplay")
        .setEmoji(this.icons.autoplay)
        .setDisabled(true),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sdelete")
        .setEmoji(this.icons.delete)
        .setDisabled(true),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("ssave")
        .setEmoji(this.icons.save)
        .setDisabled(true),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sshuffle")
        .setEmoji(this.icons.shuffle)
        .setDisabled(true),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sfilterreset")
        .setEmoji(this.icons.filterreset)
        .setDisabled(true),
    ]);
  }
}
