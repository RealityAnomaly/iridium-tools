import * as sipjs from 'sip.js';
import * as os from 'node:os';
import * as net from 'node:net';
import * as dns from 'node:dns/promises';
import * as dgram from 'node:dgram';
import { UDPTransport, UDPTransportOptions } from "./transport.ts";
import { AddressUtils } from "../core/utils.ts";

export class UDPUserAgent extends sipjs.UserAgent {
  private readonly socket: dgram.Socket;

  private constructor(socket: dgram.Socket, options: Partial<sipjs.UserAgentOptions>) {
    super(options);
    this.socket = socket;
  };

  public override async stop(): Promise<void> {
    await super.stop();

    try {
      this.socket.close();
    } catch {
      // ignore
    };
  };

  private static async resolveSourceIP(destination: string): Promise<string> {
    if (!net.isIP(destination)) {
      const addrs = await dns.resolve4(destination);
      if (addrs.length <= 0) {
        throw new Error(`failed to resolve any IPs for hostname ${destination}`);
      };

      destination = addrs[0];
    };

    let result: string | undefined;
    for (const [_name, addrList] of Object.entries(os.networkInterfaces())) {
      for (const info of addrList || []) {
        if (!info.cidr) continue;
        if (AddressUtils.isIpInCidr(destination, info.cidr)) {
          result = info.address;
          break;
        };
      };
    };

    if (!result) {
      throw new Error(`failed to resolve any interfaces with a candidate local address for destination ${destination}`);
    };

    return result;
  };

  public static async create(address: string, port: number = 5060, options?: Partial<sipjs.UserAgentOptions>): Promise<UDPUserAgent> {
    const socket = dgram.createSocket('udp4');
    const sourceIP = await this.resolveSourceIP(address);
    
    return new Promise<UDPUserAgent>((resolve, _reject) => {
      socket.bind(undefined, undefined, () => {
        resolve(new UDPUserAgent(socket, {
          logLevel: 'warn',
          viaHost: sourceIP,
          transportConstructor: UDPTransport,
          transportOptions: {
            address: address,
            port: port,
            socket: socket,
            traceSip: false
          } satisfies UDPTransportOptions,
          forceRport: true,
          ...options
        }));
      });
    });
  };
};
