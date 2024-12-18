import { SDKInternetStatus } from "../core/status.ts";

export interface IridiumSIPPayload {
  "presence"?: {
    "@entity": string,
    tuple: {
      "@id": string,
      status: {
        basic: 'open',
      },
      contact: string,
    }
  },
  "reg"?: {
    version: string,
    state: 'full',
    registration: {
      contact: {
        uri: string,
        state: {
          '@state': string,
          '@details': 'active',
        }
      }
    }
  },
  "sim-status"?: {
    code: string,
    description: string,
  },
  "signal-strength"?: {
    value: string,
  },
  "network-registration"?: {
    status: IridiumSIPNetworkRegistrationState,
  },
  "sbd-registration-state"?: {
    status: IridiumSIPSBDRegistrationState,
  },
  "sbd-attach-state"?: {
    status: IridiumSIPSBDAttachState,
  },
  "battery"?: {
    capacity: string,
    temperature: string,
    present: string,
    charging: string
  },
  "sos-state"?: {
    active: string
  },
  "gps-location"?: {
    "valid-location-data": string,
    source: string,
    "gps-fix": string,
    "gps-powered-on": string
  }
  "internet-connection"?: {
    status: SDKInternetStatus
  },
  "connected-users"?: {
    "registered-user-count": number,
    user: {
      "display-name"?: string,
      username: string,
      priority: number,
      "call_active": string
    }
  },
  "user-privileges"?: {
    user: {
      username: string,
      "can-make-calls": string,
      priority: string,
      "can-send-SMS": string,
      "can-receive-SMS": string,
      "can-send-SBD": string,
      "can-receive-SBD": string,
      "can-access-twitter": string,
      "can-access-tracking": string,
      "is-admin-user": string
    }
  },
  "call-status"?: {
    value: "I",
  },
  // deno-lint-ignore ban-types
  "call-details"?: {},
  // deno-lint-ignore ban-types
  "alerts"?: {},
};

export enum IridiumSIPNetworkRegistrationState {
  NotRegistered = 0,
  Registered = 1
};

export enum IridiumSIPSBDRegistrationState {
  NotRegistered = 0,
  Registered = 1
};

export enum IridiumSIPSBDAttachState {
  Detached = 0,
  Attached = 1
};

export class IridiumSIPPayloadUtils {
  public static stringify(payload: IridiumSIPPayload): string {
    if (payload.presence) {
      return `Presence: ${payload.presence.tuple.status.basic} ${payload.presence.tuple.contact}`;
    } else if (payload.reg) {
      return `Registration: ${payload.reg.registration.contact.uri} ${payload.reg.registration.contact.state['@details']}`;
    } else if (payload["sim-status"]) {
      return `SIM Status: ${payload["sim-status"].description}`;
    } else if (payload["signal-strength"]) {
      return `Signal Strength: ${payload["signal-strength"].value}/5`;
    } else if (payload["network-registration"]) {
      return `Network Registration: ${IridiumSIPNetworkRegistrationState[payload["network-registration"].status]}`;
    } else if (payload["sbd-registration-state"]) {
      return `SBD Registration State: ${IridiumSIPSBDRegistrationState[payload["sbd-registration-state"].status]}`;
    } else if (payload["sbd-attach-state"]) {
      return `SBD Attach State: ${IridiumSIPSBDAttachState[payload["sbd-attach-state"].status]}`;
    } else if (payload.battery) {
      return `Battery: ${payload.battery.capacity}%, ${payload.battery.charging === 'true' ? 'charging' : 'not charging'}, at ${payload.battery.temperature}°C`;
    } else if (payload["sos-state"]) {
      return `SOS State: ${payload["sos-state"].active === 'true' ? 'active' : 'inactive'}`;
    } else if (payload["gps-location"]) {
      return `GPS Location: ${payload["gps-location"]["valid-location-data"] === 'true' ? 'valid' : 'invalid'} ${payload["gps-location"]["gps-fix"] === 'true' ? 'fixed' : 'not-fixed'} ${payload["gps-location"]["gps-powered-on"] === 'true' ? 'powered-on' : 'powered-off'}`;
    } else if (payload["internet-connection"]) {
      return `Internet Connection: ${SDKInternetStatus[payload["internet-connection"].status]}`;
    } else if (payload["connected-users"]) {
      return `Connected Users: ${payload["connected-users"]["registered-user-count"]}`;
    } else if (payload["user-privileges"]) {
      return `User Privileges: ${payload["user-privileges"].user.username}`;
    } else if (payload["call-status"]) {
      return `Call Status: ${payload["call-status"].value}`;
    } else if (payload["call-details"]) {
      return `Call Details: ${JSON.stringify(payload["call-details"])}`;
    } else if (payload.alerts) {
      return `Alerts: ${JSON.stringify(payload.alerts)}`;
    } else {
      return 'Invalid payload';
    };
  };
};
