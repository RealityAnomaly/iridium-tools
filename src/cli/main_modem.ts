import * as commander from "commander";
import { IridiumCLI } from "./main.ts";
import { SDKInternetStatus, SDKInternetTerminationReason } from "../core/status.ts";

function collect(value: string, previous: string[]) {
  return previous.concat([value]);
}

interface IridiumCLIModemCallOptions {
  allowAllTraffic?: boolean;
  firewallException: [];
  dnsForwarding?: boolean;
  dialNumber?: string;
  wait: boolean;
  waitDelay: number;
};

export class IridiumCLIModem extends commander.Command {
  private readonly app: IridiumCLI;

  private async dial(options: IridiumCLIModemCallOptions): Promise<void> {
    const apiOptions = {
      allowAllTraffic: options.allowAllTraffic,
      firewallExceptions: options.firewallException,
      dnsForwarding: options.dnsForwarding,
      dialNumber: options.dialNumber
    };

    while (true) {
      while (options.wait) {
        const status = await this.app.api!.getStatus([{ name: 'iridium' }]);
        if (status.iridiumRegistration !== 'registered' && status.iridiumRegistration !== 'registered-roaming') {
          console.log(`Iridium network is not yet ready, current status ${status.iridiumRegistration}. Waiting 5 seconds`)
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        };

        if (status.iridiumSignalStrength! < 2) {
          console.log(`${status.iridiumSignalStrength} bar signal strength is not sufficient to establish data connection. Waiting 5 seconds`)
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        };

        break;
      };

      let connected = false;
      while (true) {
        const result = await this.app.api!.setInternet(true, apiOptions);
        if (!options.wait) {
          console.log(result.message);
          break;
        };

        await new Promise(resolve => setTimeout(resolve, 5000));

        // wait on status to go green
        const status = await this.app.api!.getStatus([{ name: 'active call' }]);
        if (status.internetConnectionStatus === SDKInternetStatus.Connected) {
          console.log(`Sucessfully connected to ${status.activeInternetCallNumber}`);
          connected = true;
          break;
        } else if (status.internetConnectionStatus === SDKInternetStatus.Unknown) {
          console.log(`Call failed, retrying shortly. Error: ${SDKInternetTerminationReason[status.internetTerminationReason!]}`)
          break;
        } else {
          console.log(`Connection in progress, current status is ${SDKInternetStatus[status.internetConnectionStatus!]}`)
        };
      };

      if (connected) {
        break;
      };
    };
  };

  private async hangup(_options: unknown): Promise<void> {
    const result = await this.app.api!.setInternet(false);
    console.log(result.message);
  };

  private async status(_options: unknown): Promise<void> {
    const result = await this.app.api!.getStatus([{ name: 'active call' }]);
    this.app.printStatuses(result);
  };

  constructor(app: IridiumCLI) {
    super('modem');

    this.app = app;
    this.description('Manages the state of the data modem')

    this.command('dial')
      .description('Initiates a data call')
      .option('-a, --allow-all-traffic', 'allows all traffic through the firewall (not recommended)')
      .option('-e, --firewall-exception', 'specifies a list of firewall exceptions to use', collect, [])
      .option('-d, --dns-forwarding', 'enables DNS forwarding for the connection')
      .option('-n, --dial-number', 'dials the specified number (defaults to Iridium gateway)')
      .option('-w, --wait', 'keeps retrying the call until the connection succeeds', false)
      .option('--wait-delay <seconds>', 'time between connection attempts in the case of failure, in seconds', Number.parseInt, 30)
      .action(this.dial.bind(this));
    
    this.command('hangup')
      .description('Hangs up the current data call')
      .action(this.hangup.bind(this));
    
    this.command('status')
      .description('Returns the status of the modem')
      .action(this.status.bind(this));
  };
};
