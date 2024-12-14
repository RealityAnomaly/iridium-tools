import * as sipjs from 'sip.js';
import { IridiumGoOptions } from "../core/main.ts";
import { UDPUserAgent } from "./agent.ts";

export class IridiumGoSIP {
  private readonly options: IridiumGoOptions;
  private userAgent?: UDPUserAgent;
  private registerer?: sipjs.Registerer;

  constructor(options: IridiumGoOptions) {
    this.options = options;
  };

  public async start(): Promise<void> {
    // TODO: variable IP etc
    this.userAgent = await UDPUserAgent.create(this.options.server, 5060, {
      uri: sipjs.UserAgent.makeURI(`sip:${this.options.username}@${this.options.server}`),
      authorizationPassword: this.options.password,
    });

    await this.userAgent.start();

    this.registerer = new sipjs.Registerer(this.userAgent);
    await this.registerer.register();
  };

  public async stop(): Promise<void> {
    await this.userAgent?.stop();
  };

  public async sendSMS(number: string, content: string, _wait: boolean = false): Promise<void> {
    const target = sipjs.UserAgent.makeURI(`sip:${number}@${this.options.server}`);
    if (!target) {
      throw new Error(`Failed to parse number ${number} for SMS`);
    };

    const messager = new sipjs.Messager(this.userAgent!, target, content);
    await messager.message();
  };
};
