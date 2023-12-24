import { KazagumoPlayer } from "kazagumo.mod";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, player: KazagumoPlayer) {
    const guild = await client.guilds.cache.get(player.guildId);
    client.logger.info(
      `Player Resumed in @ ${guild!.name} / ${player.guildId}`
    );
  }
}
