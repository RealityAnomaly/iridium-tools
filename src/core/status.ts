import * as types from '../sdk/types.ts';

export interface SDKStatus {
  modelName?: string;
  serialNumber?: string;
  pcbVersion?: string;
  terminalFirmwareVersion?: string;
  unnotifiedMessages?: number;
  unnotifiedVoicemails?: number;
  unnotifiedMissedCalls?: number;
  connectedSIPUsers?: number;
  callStatus?: 'active' | 'answering' | 'dialling' | 'idle' | 'incoming' | 'incoming-stop' | 'remote-ringing' | 'terminating';
  callType?: 'none' | 'voice' | 'data';
  callDirection?: 'none' | 'incoming' | 'outgoing';
  callDuration?: number;
  activeCallNumber?: string;
  internetConnectionStatus?: SDKInternetStatus
  internetConnectionDuration?: number;
  internetTerminationReason?: SDKInternetTerminationReason;
  activeInternetCallNumber?: string;
  iridiumIMEI?: string;
  iridiumRegistration?: 'unknown' | 'not-registered-not-searching' | 'not-registered-searching' | 'registered' | 'registered-roaming' | 'denied';
  iridiumSignalStrength?: number;
  iridiumTransceiverFirmwareVersion?: string;
  iridiumTransceiverHardwareVersion?: string;
  iridiumICCID?: string;
  iridiumTime?: string;
  iridiumSIMPINRequired?: 'absent' | 'pin-entered-ok' | 'pin-required' | 'pin-required-auto-enter' | 'puk-required' | 'ready';
  iridiumSIMLockStatus?: 'unknown' | 'enable' | 'disable';
  intervalTrackingStatus?: boolean;
  sosStatus?: boolean;
  validLocationData?: boolean;
  locationSource?: SDKLocationSource;
  gpsFix?: boolean;
  isGpsPoweredOn?: boolean;
  latitude?: number;
  latitudeAccuracy?: number;
  longitude?: number;
  longitudeAccuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  batteryVoltage?: number;
  batteryCapacity?: number;
  chargingStatus?: number;
  batteryCurrent?: number;
  batteryPresent?: number;
  batteryTemperature?: number;
  boardTemperature?: number;
  cpuTemperature?: number;
  antennaRaisedStatus?: boolean;
  wifiStatus?: boolean;
};

export enum SDKInternetStatus {
  Unknown = 0,
  Dialing = 1,
  Negotiating = 2,
  Authenticated = 3,
  Connected = 4,
  Terminating = 5,
  Terminated = 6
};

export enum SDKInternetTerminationReason {
  Unknown = 0,
  PPPDLaunchError = 1,
  PeerRequest = 2,
  SystemError = 3,
  OptionsError = 4,
  UserRootError = 5,
  KernelPPPError = 6,
  TerminatedBySignal = 7,
  SerialPortLockError = 8,
  SerialPortOpenError = 9,
  ConnectScriptFailed = 10,
  PTYCommandError = 11,
  PPPNegotiationFailed = 12,
  PPPAuthenticationFailed = 13,
  TerminatedByIdle = 14,
  TerminatedByTimeout = 15,
  Callback = 16,
  NoEcho = 17,
  ModemHangUp = 18,
  LoopbackDetected = 19,
  InitScriptFailed = 20,
  AuthenticationFailed = 21
};

export enum SDKLocationSource {
  Unknown = 0,
  GPS = 1,
  Iridium = 2
};

interface SDKStatusParser<T = unknown> {
  label: string;
  parse: (value: string) => T;
  stringify: (value: T) => string;
};

export class SDKStatusMapper {
  // deno-lint-ignore no-explicit-any
  private static readonly entries: Partial<Record<keyof SDKStatus, SDKStatusParser<any>>> = {
    modelName: this.map('Model name'),
    serialNumber: this.map('Serial number'),
    pcbVersion: this.map('PCB version'),
    terminalFirmwareVersion: this.map('Terminal firmware version'),
    unnotifiedMessages: this.mapInt('Unnotified messages'),
    unnotifiedVoicemails: this.mapInt('Unnotified voicemails'),
    unnotifiedMissedCalls: this.mapInt('Unnotified missed calls'),
    connectedSIPUsers: this.mapInt('Connected SIP users'),
    callStatus: this.map('Call status'),
    callType: this.map('Call type'),
    callDirection: this.map('Call direction'),
    callDuration: this.mapFloat('Call duration'),
    activeCallNumber: this.map('Active call number'),
    internetConnectionStatus: this.mapEnum('Internet connection status', SDKInternetStatus),
    internetConnectionDuration: this.mapInt('Internet connection duration'),
    internetTerminationReason: this.mapEnum('Internet termination reason', SDKInternetTerminationReason),
    activeInternetCallNumber: this.map('Active internet call number'),
    iridiumIMEI: this.map('Iridium IMEI'),
    iridiumRegistration: this.map('Iridium registration'),
    iridiumSignalStrength: this.mapInt('Iridium signal strength'),
    iridiumTransceiverFirmwareVersion: this.map('Iridium transceiver firmware version'),
    iridiumTransceiverHardwareVersion: this.map('Iridium transceiver hardware version'),
    iridiumICCID: this.map('Iridium ICCID'),
    iridiumTime: this.map('Iridium Time'),
    iridiumSIMPINRequired: this.map('Iridium SIM PIN required'),
    iridiumSIMLockStatus: this.map('Iridium SIM Lock status'),
    sosStatus: this.map('SOS status'),
    validLocationData: this.mapBool('Valid location data'),
    locationSource: this.mapEnum('Location source', SDKLocationSource),
    gpsFix: this.mapBool('GPS fix'),
    isGpsPoweredOn: this.mapBool('Is GPS powered on'),
    latitude: this.mapFloat('Latitude'),
    latitudeAccuracy: this.mapInt('Latitude accuracy'),
    longitude: this.mapFloat('Longitude'),
    longitudeAccuracy: this.mapInt('Longitude accuracy'),
    altitude: this.mapInt('Altitude'),
    altitudeAccuracy: this.mapInt('Altitude accuracy'),
    batteryVoltage: this.mapFloat('Battery voltage'),
    batteryCapacity: this.mapInt('Battery capacity'),
    chargingStatus: this.mapBool('Charging status'),
    batteryCurrent: this.mapFloat('Battery current'),
    batteryPresent: this.mapBool('Battery present'),
    batteryTemperature: this.mapFloat('Battery temperature'),
    boardTemperature: this.mapInt('Board temperature'),
    cpuTemperature: this.mapInt('CPU temperature'),
    antennaRaisedStatus: this.mapBool('Antenna raised status'),
    wifiStatus: this.mapBool('Wi-fi status')
  };

  private static map(label: string): SDKStatusParser<string> {
    return {
      label: label,
      parse: (value: string) => value,
      stringify: (value: string) => String(value)
    }
  };

  private static mapInt(label: string): SDKStatusParser<number> {
    return {
      label: label,
      parse: (value: string) => Number.parseInt(value),
      stringify: (value: number) => value.toString()
    }
  };

  private static mapFloat(label: string): SDKStatusParser<number> {
    return {
      label: label,
      parse: (value: string) => Number.parseFloat(value),
      stringify: (value: number) => value.toString()
    }
  };

  private static mapBool(label: string): SDKStatusParser<boolean> {
    return {
      label: label,
      parse: (value: string) => value === 'true' || value === '1',
      stringify: (value: boolean) => String(value),
    }
  };

  private static mapEnum(label: string, type: Record<number, string>): SDKStatusParser<number> {
    return {
      label: label,
      parse: (value: string) => Number.parseInt(value),
      stringify: (value: number) => type[value]
    }
  };

  public static parse(values: types.sdk_status_t[]): SDKStatus {
    const result: SDKStatus = {};
    for (const value of values) {
      for (const [k, v] of Object.entries(this.entries)) {
        if (value.name === v.label) {
          result[k as keyof SDKStatus] = v.parse(value.value);
          break;
        };
      };
    };

    return result;
  };

  public static print(values: SDKStatus) {
    for (const [k, v] of Object.entries(values)) {
      const mapper = this.entries[k as keyof SDKStatus];
      if (mapper) {
        console.log(`${mapper.label}: ${mapper.stringify(v)}`);
      } else {
        console.log(`${k}: ${v}`);
      };
    };
  };
}
