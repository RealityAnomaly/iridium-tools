export enum SDKTaskType {
  Reboot = 0,
  Emergency = 1,
  InternetService = 2,
  SendMessage = 3,
  UnlockSIM = 4,
  SIMPINRequirement = 5,
  SetFactoryDefaults = 6,
  ModifySIMPIN = 7,
  SIMSMSC = 8,
  ActivateGPS = 9,
  PurgeMessage = 10,
  Upgrade9523 = 21
};

export interface SDKTaskResult<TResponse extends number = number> {
  taskID: SDKTaskType;
  responseCode: TResponse;
  message: string;
};

export enum SDKError {
  NoError = 0,
  UnknownRequest = 101,
  InvalidCredentials = 102,
  AccessDenied = 103,
  ErrorSavingValue = 104,
  UnknownError = 105,
  NotImplemented = 106,
  InvalidTAG = 201,
  InvalidValue = 202,
  PartialResult = 205,
  UnknownUser = 301,
  CannotRemoveSystemUser = 302,
  InvalidValues = 303,
  DuplicatePhoneNumber = 351,
  NoContactFound = 352,
  InvalidRestorePointOperation = 401,
  InvalidRestorePointVersion = 402,
  NoRestorePointOperationFound = 403,
  RestorePointAlreadyExists = 404,
  ErrorCreatingRestorePoint = 405,
  ErrorRemovingRestorePoint = 406,
  NoRestorePointFound = 407,
  RestorePointNameRequired = 408,
  RestorePointLimitReached = 409,
  ErrorRestoring = 501,
  ConnectionTimeout = 1002,
  InternalError = 1003,
  InvalidRequest = 1004
};

export interface DataCallOptions {
  allowAllTraffic?: boolean;
  firewallExceptions?: string[];
  dnsForwarding?: boolean;
  dialNumber?: string;
};
