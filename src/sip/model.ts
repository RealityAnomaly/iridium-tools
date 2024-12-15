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
    version: number,
    state: 'full',
    registration: {
      contact: {
        uri: string,
        state: {
          '@state': number,
          '@details': 'active',
        }
      }
    }
  },
  "sim-status"?: {
    code: number,
    description: string,
  },
  "signal-strength"?: {
    value: number,
  },
  "network-registration"?: {
    status: number,
  },
  "sbd-registration-state"?: {
    status: number,
  },
  "sbd-attach-state"?: {
    status: number,
  },
  "battery"?: {
    capacity: number,
    temperature: number,
    present: boolean,
    charging: boolean
  },
  "sos-state"?: {
    active: boolean
  },
  "gps-location"?: {
    "valid-location-data": boolean,
    source: string,
    "gps-fix": boolean,
    "gps-powered-on": boolean
  }
  "internet-connection"?: {
    status: number
  },
  "connected-users"?: {
    "registered-user-count": number,
    user: {
      "display-name"?: string,
      username: string,
      priority: number,
      "call_active": boolean
    }
  },
  "user-privileges"?: {
    user: {
      username: string,
      "can-make-calls": boolean,
      priority: number,
      "can-send-SMS": boolean,
      "can-receive-SMS": boolean,
      "can-send-SBD": boolean,
      "can-receive-SBD": boolean,
      "can-access-twitter": boolean,
      "can-access-tracking": boolean,
      "is-admin-user": boolean
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
      return `Network Registration: ${payload["network-registration"].status}`;
    } else if (payload["sbd-registration-state"]) {
      return `SBD Registration State: ${payload["sbd-registration-state"].status}`;
    } else if (payload["sbd-attach-state"]) {
      return `SBD Attach State: ${payload["sbd-attach-state"].status}`;
    } else if (payload.battery) {
      return `Battery: ${payload.battery.capacity}% ${payload.battery.charging ? 'charging' : 'discharging'} at ${payload.battery.temperature}°C`;
    } else if (payload["sos-state"]) {
      return `SOS State: ${payload["sos-state"].active ? 'active' : 'inactive'}`;
    } else if (payload["gps-location"]) {
      return `GPS Location: ${payload["gps-location"]["valid-location-data"] ? 'valid' : 'invalid'} ${payload["gps-location"]["gps-fix"] ? 'fixed' : 'not fixed'} ${payload["gps-location"]["gps-powered-on"] ? 'powered on' : 'powered off'}`;
    } else if (payload["internet-connection"]) {
      return `Internet Connection: ${payload["internet-connection"].status}`;
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
