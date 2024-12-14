// deno-lint-ignore-file no-explicit-any
import * as sipjs from 'sip.js';
import * as dgram from 'node:dgram';

// sip.js assumes WebRTC but this is not available on nodejs. Provide a dummy
// interface.
interface RTCSessionDescriptionInit {}

// Options for receiving and sending datagrams.
export interface UDPTransportOptions {
  socket: dgram.Socket;
  port: number;
  address: string;
  traceSip: boolean;
}

// A dummy handler to create and close UDP ports and negiotate codecs. Currently
// no ports are opened.
export class UDPSessionDescriptionHandler implements sipjs.SessionDescriptionHandler {
  private logger: sipjs.Core.Logger;

  constructor(logger: sipjs.Core.Logger, _options: any) {
    this.logger = logger;
    // TODO(holger): Attempt to open one or two (RTP+RTCP) ports.
  }

  close() {
    // TODO(holger): Close the ports that we opened earlier.
    this.logger.log('close()');
  }

  getDescription(
    _options?: sipjs.SessionDescriptionHandlerOptions,
    _modifiers?: sipjs.SessionDescriptionHandlerModifier[]
  ): Promise<sipjs.BodyAndContentType> {
    // TODO(holger): Return the listening address and port.
    const body = `v=0
o=Z 0 0 IN IP4 127.0.0.1
s=Z
c=IN IP4 127.0.0.1
t=0 0
m=audio 8000 RTP/AVP 3 110 8 0 98 101
a=rtpmap:110 speex/8000
a=rtpmap:98 iLBC/8000
a=fmtp:98 mode=20
a=rtpmap:101 telephone-event/8000
a=fmtp:101 0-15
a=sendrecv
`;
    return Promise.resolve({ body, contentType: 'application/sdp' });
  }

  hasDescription(): boolean {
    return true;
  }

  holdModifier(description: RTCSessionDescriptionInit) {
    return Promise.resolve(description);
  }

  setDescription(
    _sessionDescription: string,
    _options: sipjs.SessionDescriptionHandlerOptions = {},
    _modifiers: sipjs.SessionDescriptionHandlerModifier[] = []
  ) {
    return Promise.resolve();
  }

  sendDtmf(_tones: string, _options?: any): boolean {
    return false;
  }
}

// A minimal sip.js transport for UDP. Due sip.js limitations responses
// can only be sent to a static and configured remote (proxy).
export class UDPTransport implements sipjs.Transport {
  onConnect: (() => void) | undefined;
  onDisconnect: ((error?: Error) => void) | undefined;
  onMessage: ((message: string) => void) | undefined;

  private _protocol = 'udp';
  private _state: sipjs.TransportState = sipjs.TransportState.Disconnected;
  private _stateEventEmitter = new sipjs.EmitterImpl<sipjs.TransportState>;
  private _socket: dgram.Socket;

  private configuration: UDPTransportOptions;
  private logger: sipjs.Core.Logger;

  constructor(logger: sipjs.Core.Logger, options: UDPTransportOptions) {
    this.logger = logger;
    this.configuration = options;

    this._socket = options.socket;
    this._stateEventEmitter = new sipjs.EmitterImpl<sipjs.TransportState>();
  };

  public async dispose(): Promise<void> {
    await this.disconnect();
  };

  public get protocol() {
    return this._protocol;
  };

  public get state() {
    return this._state;
  };

  public get stateChange(): sipjs.Emitter<sipjs.TransportState> {
    return this._stateEventEmitter;
  };

  public async connect(): Promise<void> {
    this._socket.on('message', (msg, _rinfo) => {
      if (this.onMessage) {
        this.logger.log(`Received message ${msg.toString()}`);
        this.onMessage(msg.toString());
      };
    });
    
    this._state = sipjs.TransportState.Connected;
    this._stateEventEmitter.emit(this._state);
    if (this.onConnect) {
      this.onConnect();
    };
  };

  public async disconnect(): Promise<void> {
    this._socket.removeAllListeners();
  };

  public isConnected(): boolean {
    return this.state === sipjs.TransportState.Connected;
  };

  public async send(message: string): Promise<void> {
    if (this.configuration.traceSip === true) {
      this.logger.log("Sending UDP message:\n\n" + message + "\n");
    };

    return new Promise<void>((resolve, reject) => {
      this._socket.send(message, this.configuration.port, this.configuration.address, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        };
      });
    });
  };
};
