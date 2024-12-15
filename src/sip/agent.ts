import * as sipjs from 'sip.js';
import * as os from 'node:os';
import * as net from 'node:net';
import * as dns from 'node:dns/promises';
import * as dgram from 'node:dgram';
import { UDPTransport, UDPTransportOptions } from "./transport.ts";
import { AddressUtils } from "../core/utils.ts";

interface UDPUserAgentOptions extends sipjs.UserAgentOptions {
  viaPort: number;
};

export class UDPUserAgent extends sipjs.UserAgent {
  private readonly socket: dgram.Socket;
  private readonly options2: Required<UDPUserAgentOptions>;
  private readonly logger2: sipjs.Core.Logger;
  private _contact2?: sipjs.Core.Contact;

  private constructor(socket: dgram.Socket, options: Partial<UDPUserAgentOptions>) {
    super(options);
    this.socket = socket;
    this.options2 = options as Required<UDPUserAgentOptions>;
    this.logger2 = this.getLogger('sip.UDPUserAgent');

    this._contact2 = this.initContact2();
    this.transport.onMessage = (message: string): void => this.onTransportMessage2(message);
  };

  public override async stop(): Promise<void> {
    await super.stop();

    try {
      this.socket.close();
    } catch {
      // ignore
    };
  };

  public override get contact(): sipjs.Core.Contact {
    return this._contact2 ? this._contact2 : super.contact;
  };
  
  private initContact2(): sipjs.Core.Contact {
    const contactName = this.options2.contactName !== "" ? this.options2.contactName : this.createRandomToken(8);
    const contactParams = this.options2.contactParams;
    const contact = {
      pubGruu: undefined,
      tempGruu: undefined,
      uri: new sipjs.URI("sip", contactName, this.options2.viaHost, this.options2.viaPort, contactParams),
      toString: (
        contactToStringOptions: { anonymous?: boolean; outbound?: boolean; register?: boolean } = {}
      ): string => {
        const anonymous = contactToStringOptions.anonymous || false;
        const outbound = contactToStringOptions.outbound || false;
        const register = contactToStringOptions.register || false;
        let contactString = "<";
        // 3.3.  Using a GRUU
        // Once a user agent obtains GRUUs from the registrar, it uses them in
        // several ways.  First, it uses them as the contents of the Contact
        // header field in non-REGISTER requests and responses that it emits
        // (for example, an INVITE request and 200 OK response).
        // https://datatracker.ietf.org/doc/html/rfc5627#section-3.3
        if (anonymous) {
          contactString +=
            this.contact.tempGruu ||
            `sip:anonymous@anonymous.invalid;transport=${contactParams.transport ? contactParams.transport : "ws"}`;
        } else if (register) {
          contactString += this.contact.uri;
        } else {
          contactString += this.contact.pubGruu || this.contact.uri;
        }
        if (outbound) {
          contactString += ";ob";
        }
        contactString += ">";
        if (this.options2.instanceIdAlwaysAdded) {
          contactString += ';+sip.instance="<urn:uuid:' + this.instanceId + '>"';
        }
        return contactString;
      }
    };
    return contact;
  };

  private onTransportMessage2(messageString: string): void {
    const message = sipjs.Core.Parser.parseMessage(messageString, this.getLogger("sip.Parser"));
    if (!message) {
      this.logger2.warn("Failed to parse incoming message. Dropping.");
      return;
    }

    if (this.state === sipjs.UserAgentState.Stopped && message instanceof sipjs.Core.IncomingRequestMessage) {
      this.logger2.warn(`Received ${message.method} request while stopped. Dropping.`);
      return;
    }

    // A valid SIP request formulated by a UAC MUST, at a minimum, contain
    // the following header fields: To, From, CSeq, Call-ID, Max-Forwards,
    // and Via; all of these header fields are mandatory in all SIP
    // requests.
    // https://tools.ietf.org/html/rfc3261#section-8.1.1
    const hasMinimumHeaders = (): boolean => {
      const mandatoryHeaders: Array<string> = ["from", "to", "call_id", "cseq", "via"];
      for (const header of mandatoryHeaders) {
        if (!message.hasHeader(header)) {
          this.logger2.warn(`Missing mandatory header field : ${header}.`);
          return false;
        }
      }
      return true;
    };

    // Request Checks
    if (message instanceof sipjs.Core.IncomingRequestMessage) {
      // This is port of SanityCheck.minimumHeaders().
      if (!hasMinimumHeaders()) {
        this.logger2.warn(`Request missing mandatory header field. Dropping.`);
        return;
      }

      // FIXME: This is non-standard and should be a configurable behavior (desirable regardless).
      // Custom SIP.js check to reject request from ourself (this instance of SIP.js).
      // This is port of SanityCheck.rfc3261_16_3_4().
      if (!message.toTag && message.callId.substr(0, 5) === this.options2.sipjsId) {
        this.userAgentCore.replyStateless(message, { statusCode: 482 });
        return;
      }

      // FIXME: This should be Transport check before we get here (Section 18).
      // Custom SIP.js check to reject requests if body length wrong.
      // This is port of SanityCheck.rfc3261_18_3_request().
      const len: number = this.utf8Length(message.body);
      const contentLength: string | undefined = message.getHeader("content-length");
      if (contentLength && len < Number(contentLength)) {
        this.userAgentCore.replyStateless(message, { statusCode: 400 });
        return;
      }
    }

    // Response Checks
    if (message instanceof sipjs.Core.IncomingResponseMessage) {
      // This is port of SanityCheck.minimumHeaders().
      if (!hasMinimumHeaders()) {
        this.logger2.warn(`Response missing mandatory header field. Dropping.`);
        return;
      }

      // Custom SIP.js check to drop responses if multiple Via headers.
      // This is port of SanityCheck.rfc3261_8_1_3_3().
      if (message.getHeaders("via").length > 1) {
        this.logger2.warn("More than one Via header field present in the response. Dropping.");
        return;
      }

      // FIXME: This should be Transport check before we get here (Section 18).
      // Custom SIP.js check to drop responses if bad Via header.
      // This is port of SanityCheck.rfc3261_18_1_2().
      if (message.via.host !== this.options2.viaHost || message.via.port !== this.options2.viaPort) {
        this.logger2.warn("Via sent-by in the response does not match UA Via host value. Dropping.");
        return;
      }

      // FIXME: This should be Transport check before we get here (Section 18).
      // Custom SIP.js check to reject requests if body length wrong.
      // This is port of SanityCheck.rfc3261_18_3_response().
      const len: number = this.utf8Length(message.body);
      const contentLength: string | undefined = message.getHeader("content-length");
      if (contentLength && len < Number(contentLength)) {
        this.logger2.warn("Message body length is lower than the value in Content-Length header field. Dropping.");
        return;
      }
    }

    // Handle Request
    if (message instanceof sipjs.Core.IncomingRequestMessage) {
      this.userAgentCore.receiveIncomingRequestFromTransport(message);
      return;
    }

    // Handle Response
    if (message instanceof sipjs.Core.IncomingResponseMessage) {
      this.userAgentCore.receiveIncomingResponseFromTransport(message);
      return;
    }

    throw new Error("Invalid message type.");
  };

  private createRandomToken(size: number, base = 32): string {
    let token = "";
    for (let i = 0; i < size; i++) {
      const r: number = Math.floor(Math.random() * base);
      token += r.toString(base);
    }
    return token;
  };

  private utf8Length(str: string): number {
    return encodeURIComponent(str).replace(/%[A-F\d]{2}/g, "U").length;
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
          contactName: options?.authorizationUsername!,
          contactParams: {
            transport: 'udp',
          },
          viaHost: sourceIP,
          viaPort: socket.address().port,
          transportConstructor: UDPTransport,
          transportOptions: {
            address: address,
            sourceAddress: sourceIP,
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
