import * as winston from 'winston';
import * as sdk from '../sdk/index.ts';
import * as types from '../sdk/types.ts';
import { DataCallOptions, SDKError, SDKTaskResult, SDKTaskType } from "./types.ts";
import { SDKStatus, SDKStatusMapper } from "./status.ts";

export interface IridiumGoOptions {
  username: string;
  password: string;
  server: string;
};

/**
 * Convenience wrapper around the Iridium Go SOAP API
 */
export class IridiumGo {
  protected readonly options: IridiumGoOptions;
  protected readonly logger?: winston.Logger;

  protected readonly client: sdk.SdkClient;

  constructor(options: IridiumGoOptions, logger: winston.Logger | undefined, client: sdk.SdkClient) {
    this.options = options;
    this.logger = logger;
    this.client = client;
  };

  public static async create(options: IridiumGoOptions, logger?: winston.Logger): Promise<IridiumGo> {
    const client = await sdk.createClientAsync(`http://${options.server}/sdk/sdk.wsdl`, undefined, `http://${options.server}/sdk/sdk.php`);
    return new IridiumGo(options, logger, client);
  };

  private get userCredentials(): types.sdk_user_credentials_t {
    return {
      userName: this.options.username,
      password: this.options.password
    };
  };

  private assert<T extends types.sdk_response_t>(response: T): T {
    if (Number.parseInt(response.error) === 0) return response;
    const code = SDKError[Number.parseInt(response.error)];
    throw new Error(`SDK call returned error ${code}: ${response.errorMessage}`);
  };

  /**
   * Reboots the system
   */
  public async reboot(module: 'system' = 'system'): Promise<void> {
    await this.performTask(SDKTaskType.Reboot, [{
      name: 'module',
      value: module,
      dataType: 'string'
    }]);
  };

  /**
   * Sets the emergency SOS state (use with extreme caution).
   */
  public async setEmergency(state: boolean): Promise<types.sdk_task_set_emergency_t> {
    const result = await this.performTask(SDKTaskType.Emergency, [{
      name: 'set state',
      value: state.toString(),
      dataType: 'bool'
    }]);

    return result.responseCode;
  };

  /**
   * Sets the state of the modem (initiates a data call)
   */
  public async setInternet(state: boolean, options?: DataCallOptions): Promise<SDKTaskResult<types.sdk_task_set_internet_t>> {
    const sdkOptions: types.sdk_generic_option_t[] = [{
      name: 'set state',
      value: state.toString(),
      dataType: 'bool'
    }];

    if (options?.allowAllTraffic !== undefined) {
      sdkOptions.push({ name: 'Firewall allow all traffic', value: options.allowAllTraffic.toString(), dataType: 'bool' });
    };

    for (const exception of options?.firewallExceptions || []) {
      sdkOptions.push({ name: 'Firewall exceptions', value: exception, dataType: 'string' });
    };

    if (options?.dnsForwarding !== undefined) {
      sdkOptions.push({ name: 'Enable DNS forwarding', value: options.dnsForwarding.toString(), dataType: 'bool' });
    };

    if (options?.dialNumber !== undefined) {
      sdkOptions.push({ name: 'Dial number', value: options.dialNumber, dataType: 'string' });
    };

    return await this.performTask(SDKTaskType.InternetService, sdkOptions);
  };

  /**
   * Sends a quick GPS message
   */
  public async sendQuickGPS(type: string): Promise<SDKTaskResult<types.sdk_task_send_message_t>> {
    return await this.performTask(SDKTaskType.SendMessage, [{
      name: 'message type',
      value: type,
      dataType: 'string'
    }]);
  };

  /**
   * Unlocks the SIM using the PIN code
   */
  public async unlockSIM(pin: string): Promise<SDKTaskResult<types.sdk_task_generic_t>> {
    return await this.performTask(SDKTaskType.UnlockSIM, [{
      name: 'SIM PIN',
      value: pin,
      dataType: 'string'
    }]);
  };

  /**
   * Unlocks the SIM using the PUK code
   */
  public async unlockSIMWithPUK(puk: string): Promise<SDKTaskResult<types.sdk_task_generic_t>> {
    return await this.performTask(SDKTaskType.UnlockSIM, [{
      name: 'PUK code',
      value: puk,
      dataType: 'string'
    }]);
  };

  /**
   * Sets the state of SIM PIN requirement
   */
  public async lockSIM(pin: string): Promise<SDKTaskResult<types.sdk_task_generic_t>> {
    return await this.performTask(SDKTaskType.UnlockSIM, [{
      name: 'SIM PIN',
      value: pin,
      dataType: 'string'
    }]);
  };

  /**
   * Requires both new and old SIM PIN to modify the PIN.
   */
  public async changeSIMPIN(newPin: string, oldPin: string): Promise<SDKTaskResult<types.sdk_task_generic_t>> {
    return await this.performTask(SDKTaskType.UnlockSIM, [
      {
        name: 'SIM PIN',
        value: newPin,
        dataType: 'string'
      },
      {
        name: 'SIM PIN',
        value: oldPin,
        dataType: 'string'
      }
    ]);
  };

  /**
   * API will report current SMSC saved within the SIM card.
   */
  public async getSIMSMSC(): Promise<string> {
    const result = await this.performTask(SDKTaskType.SIMSMSC);
    return result.message;
  };

  /**
   * The provided SMSC will be saved within the SIM card.
   */
  public async setSIMSMSC(smsc: string): Promise<SDKTaskResult<types.sdk_task_generic_t>> {
    return await this.performTask(SDKTaskType.SIMSMSC, [{
      name: 'SMSC',
      value: smsc,
      dataType: 'string',
    }]);
  };

  /**
   * When requested, GPS will be powered up to get location data.
   */
  public async activateGPS(): Promise<SDKTaskResult<types.sdk_task_generic_t>> {
    return await this.performTask(SDKTaskType.ActivateGPS);
  };

  /**
   * When requested, the message history within unit will be cleared.
   */
  public async purgeMessages(): Promise<SDKTaskResult<types.sdk_task_generic_t>> {
    return await this.performTask(SDKTaskType.PurgeMessage);
  };

  /**
   * Resets all settings to the factory default state.
   */
  public async factoryReset(): Promise<SDKTaskResult<types.sdk_task_generic_t>> {
    return await this.performTask(SDKTaskType.SetFactoryDefaults);
  };

  // bare wrappers around SOAP methods
  public async addModifyUser(user: types.sdk_user_t): Promise<void> {
    const [result] = await this.client.addModifyUserAsync({
      userCredentials: this.userCredentials,
      user: user
    });

    this.assert(result.addModifyUserResponse);
  };

  public async addNewContact(name: string, number: string, isFavourite: boolean = false): Promise<void> {
    const [result] = await this.client.addNewContactAsync({
      userCredentials: this.userCredentials,
      name: name,
      number: number,
      isFavourite: isFavourite
    });

    this.assert(result.addContactResult);
  };

  public async getContactList(): Promise<types.sdk_contact_t[]> {
    const [result] = await this.client.getContactListAsync({
      userCredentials: this.userCredentials
    });

    return this.assert(result.contactList).contacts!;
  };

  public async getSettings(reqList?: types.sdk_configuration_tagRequest_t[]): Promise<types.sdk_configuration_t[]> {
    const [result] = await this.client.getSettingsAsync({
      userCredentials: this.userCredentials,
      reqList: { requestList: reqList }
    });

    return this.assert(result.configs).configurations!;
  };

  public async getStatus(options?: types.sdk_generic_option_request_t[]): Promise<SDKStatus> {
    const [result] = await this.client.getStatusAsync({
      userCredentials: this.userCredentials,
      request: { options: options }
    });

    const sdkTypes = this.assert(result.statusOutput).status!;
    return SDKStatusMapper.parse(sdkTypes);
  };

  public async getTransceiverInfo(): Promise<types.sdk_status_t[]> {
    const [result] = await this.client.getTransceiverInfoAsync(null);
    return this.assert(result.transceiverInfo).status!;
  };

  public async getUserDetails(): Promise<types.sdk_user_t> {
    const [result] = await this.client.getUserDetailsAsync({
      userCredentials: this.userCredentials
    });

    return this.assert(result.login).user!;
  };

  public async getUserList(): Promise<types.sdk_user_t[]> {
    const [result] = await this.client.getUserListAsync({
      userCredentials: this.userCredentials
    });

    return this.assert(result.getUserListResponse).users!;
  };

  public async getVersion(): Promise<types.sdk_version_t> {
    const [result] = await this.client.getVersionAsync(null);
    return result.versionNumber;
  };

  public async modifyContact(contact: types.sdk_contact_t): Promise<void> {
    const [result] = await this.client.modifyContactAsync({
      userCredentials: this.userCredentials,
      contact: contact
    });

    this.assert(result.modifyContactResult);
  };

  public async performTasks(requestList: types.sdk_task_request_t[]): Promise<SDKTaskResult[]> {
    const [result] = await this.client.performTaskAsync({
      userCredentials: this.userCredentials,
      taskList: {
        requestList: requestList
      }
    });

    let results = this.assert(result.parameters).taskResults!;
    results = Array.isArray(results) ? results : [results];

    return results.map(r => {
      return {
        taskID: Number.parseInt(r.taskID),
        responseCode: Number.parseInt(r.responseCode),
        message: r.message,
      } satisfies SDKTaskResult;
    });
  };

  public async performTask(taskID: SDKTaskType, options?: types.sdk_generic_option_t[]): Promise<SDKTaskResult> {
    const results = await this.performTasks([{
      taskID: taskID.toString(),
      options: options
    }]);

    return results.find(r => r.taskID === taskID)!;
  };

  public async removeContact(contactID: number): Promise<void> {
    const [result] = await this.client.removeContactAsync({
      userCredentials: this.userCredentials,
      contactID: contactID
    });

    this.assert(result.removeContactResult);
  };

  public async removeUser(userName: string): Promise<void> {
    const [result] = await this.client.removeUserAsync({
      userCredentials: this.userCredentials,
      userName: userName
    });

    this.assert(result.removeUserResponse);
  };

  public async setSettings(setList: types.sdk_configuration_setRequest_list_t): Promise<types.sdk_configuration_set_Result_t[]> {
    const [result] = await this.client.setSettingsAsync({
      userCredentials: this.userCredentials,
      setList: setList
    });

    return this.assert(result.setSettingsResponse).setResults!;
  };
};
