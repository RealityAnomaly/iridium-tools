// deno-lint-ignore-file no-explicit-any
import * as winston from "winston";
import * as commander from "commander";
import * as csv from "@std/csv/stringify";
import * as xml from "@libs/xml";
import { IridiumGo } from "../core/main.ts";
import { IridiumCLIModem } from "./main_modem.ts";
import { SDKStatus, SDKStatusMapper } from "../core/status.ts";

import * as sipjs from 'sip.js';
import { IridiumSIPPayload, IridiumSIPPayloadUtils } from "../sip/model.ts";

export class IridiumCLI {
  public logger?: winston.Logger;
  public api?: IridiumGo;
  public format: 'text' | 'json' = 'text';

  private constructor() {}
  private increaseVerbosity(_dummyValue: string, previous: number): number {
    return previous + 1;
  };

  private async preSubcommand(thisCommand: commander.Command, _actionCommand: commander.Command): Promise<void> {
    const options = thisCommand.opts();
    let logLevel = 'info';
    if (options.verbose === 1) {
      logLevel = 'debug';
    } else if (options.verbose >= 2) {
      logLevel = 'silly';
    };

    this.format = options.format;
    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.cli(),
      transports: [
        new winston.transports.Console(),
      ],
    });

    this.api = await IridiumGo.create({
      username: options.username,
      password: options.password,
      server: options.server
    }, this.logger);
  };

  public printStatuses(status: SDKStatus) {
    if (this.format === 'json') {
      console.log(JSON.stringify(status, undefined, 2));
    } else {
      SDKStatusMapper.print(status);
    };
  };

  private async status(_options: unknown): Promise<void> {
    const result = await this.api!.getStatus();
    this.printStatuses(result);
  };

  private async watch(_options: unknown): Promise<void> {
    const sip = await this.api!.getSIP();
    const uri = sipjs.UserAgent.makeURI(`sip:${this.api!.options.username}@${this.api!.options.server}`);

    const types = [
      'presence',
      'reg',
      'sim-status',
      'signal-strength',
      'network-registration',
      'sbd-registration-state',
      'sbd-attach-state',
      'battery',
      'sos-state',
      //'current-gps-location',
      'last-known-gps-location',
      'internet-connection',
      'connected-users',
      'user-privileges',
      'call-status',
      //'call-details',
      //'alerts'
    ];

    const subscribers: sipjs.Subscriber[] = [];
    for (const _type of types) {
      const subscriber = new sipjs.Subscriber(sip.userAgent!, uri!, _type);
      subscriber.delegate = {
        onNotify: (notification: sipjs.Notification) => {
          const result = xml.parse(notification.request.body) as IridiumSIPPayload;
          console.log('SIP Notification => ' + IridiumSIPPayloadUtils.stringify(result));
          notification.accept();
        }
      };

      subscriber.subscribe();
      subscribers.push(subscriber);
    };

    return new Promise(resolve => {
      Deno.addSignalListener("SIGINT", () => {
        for (const subscriber of subscribers) {
          subscriber.unsubscribe();
        };

        resolve();
      });      
    });
  };

  private async sendSms(options: any): Promise<void> {
    const sip = await this.api!.getSIP();
    await sip.sendSMS(options.number, options.message);
  };

  private async graphSignal(_options: unknown): Promise<void> {
    let running = true;
    let timer = -1;
    const listener = (async () => {
      console.log('Press any key to stop data collection');
      await Deno.stdin.read(new Uint8Array(1));
      if (timer !== -1) clearTimeout(timer);
      running = false;
    });

    const data: Record<string, number> = {};
    const worker = (async () => {
      while (running) {
        try {
          const status = await this.api!.getStatus([{ name: 'iridium' }]);
          data[new Date().toISOString()] = status.iridiumSignalStrength!;
        } catch {
          // pass
        };
        
        await new Promise(resolve => timer = setTimeout(resolve, 5000));
      };
    });

    await Promise.any([listener(), worker()]);
    const average = Object.values(data).reduce((a, b) => a + b, 0) / Object.keys(data).length;
    console.log(`Collected ${Object.keys(data).length} data points`);
    console.log(`Average signal strength: ${average}`);

    const results = [];
    for (const [k, v] of Object.entries(data)) {
      results.push({ timestamp: k, signal: v });
    };

    const result = csv.stringify(results, { columns: ['timestamp', 'signal'], headers: true });
    await Deno.writeTextFile('signal.csv', result);
  };

  private build(): commander.Command {
    const program = new commander.Command();
    program.hook('preSubcommand', this.preSubcommand.bind(this));

    program
      .name('iridium-cli')
      .description('Controls Iridium Go devices via their API')
      .addOption(new commander.Option('-u, --username [username]', 'specify the username to use to log into the device').default('guest').env('IRIDIUM_USERNAME'))
      .addOption(new commander.Option('-p, --password [password]', 'specify the password to use to log into the device').default('guest').env('IRIDIUM_PASSWORD'))
      .addOption(new commander.Option('-s, --server [address]', 'specify the server hostname or IP address to use').default('iridiumgo.lan').env('IRIDIUM_SERVER'))
      .addOption(new commander.Option('-f, --format [format]', 'set the format of data returned to stdout').choices(['text', 'json']).default('text'))
      .option('-v, --verbose', 'increase the verbosity (can be specified up to two times)', this.increaseVerbosity.bind(this), 0)

    program.command('status')
      .description('Returns all status information for the device')
      .action(this.status.bind(this));
    
    program.command('watch')
      .description('Connects via SIP and watches events from the device')
      .action(this.watch.bind(this));
    
    program.command('send-sms')
      .description('Sends a SMS message using the provided number and content')
      .option('-n, --number <number>', 'specify the number to send to')
      .option('-m, --message <content>', 'specify the message content')
      .action(this.sendSms.bind(this));
    
    program.command('graph-signal')
      .description('Creates a time-series graph of signal quality')
      .action(this.graphSignal.bind(this));

    program.addCommand(new IridiumCLIModem(this));
    return program;
  };

  private async cleanup(): Promise<void> {
    await this.api?.stop();
  };

  public static async run() {
    const instance = new IridiumCLI();
    const command = instance.build();
    await command.parseAsync();
    await instance.cleanup();
  };
};

if (import.meta.main) {
  await IridiumCLI.run();
};
