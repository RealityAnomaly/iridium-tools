// shared
export interface sdk_user_credentials_t {
  userName: string;
  password: string;
};

export interface sdk_configuration_t {
  friendlyName: string;
  tag: string;
  dataType: 'string' | 'bool' | 'int';
  value: string;
  minValue: string;
  maxValue: string;
};

export interface sdk_generic_option_request_t {
  name: string;
};

export interface sdk_generic_option_t {
  name: string;
  value: string;
  dataType: 'string' | 'bool' | 'int';
};

export interface sdk_user_t {
  userName: string;
  password: string;
  outgoingCall: boolean;
  userPriority: number;
  sendSms: boolean;
  receiveSms: boolean;
  canAccessTwitter: boolean;
  tracking: boolean;
  isAdmin: boolean;
};

export interface sdk_contact_t {
  id: number;
  name: string;
  number: string;
  isFavourite: boolean;
}

export interface sdk_response_t {
  error: string;
  errorMessage: string;
};

// getVersion
export interface sdk_version_t {
  apiVersion: string;
  firmwareVersion: string;
};

// getStatus
export interface sdk_status_request_t {
  options?: sdk_generic_option_request_t[];
};

export interface sdk_status_get_response_t extends sdk_response_t {
  status?: sdk_status_t[];
}

export interface sdk_status_t {
  name: string;
  value: string;
};

// getSettings
export interface sdk_configuration_tagRequest_t {
  tag: string;
};

export interface sdk_configuration_requestList_t {
  requestList?: sdk_configuration_tagRequest_t[];
};

export interface sdk_configuration_get_Response_t extends sdk_response_t {
  configurations?: sdk_configuration_t[];
};

// setSettings
export interface sdk_configuration_setRequest_t {
  tag: string;
  value: string;
};

export interface sdk_configuration_setRequest_list_t {
  setRequests: sdk_configuration_setRequest_t[];
};

export interface sdk_configuration_set_Result_t {
  tag: string;
  error: number;
  message: string;
};

export interface sdk_configuration_set_Response_t extends sdk_response_t {
  setResults?: sdk_configuration_set_Result_t[];
};

// performTask
export interface sdk_task_request_t {
  taskID: string;
  options?: sdk_generic_option_t[];
};

export interface sdk_task_requestList_t {
  requestList: sdk_task_request_t[];
};

export interface sdk_task_perform_Result_t {
  taskID: string;
  responseCode: string;
  message: string;
};

export interface sdk_task_perform_Response_t extends sdk_response_t {
  taskResults?: sdk_task_perform_Result_t | sdk_task_perform_Result_t[];
};

// getUserList
export interface sdk_user_getList_Response_t extends sdk_response_t {
  users?: sdk_user_t[];
};

// getUserDetails
export interface sdk_user_details_response_t extends sdk_response_t {
  user: sdk_user_t;
};

// getContactList
export interface sdk_contact_getList_Response_t extends sdk_response_t {
  contacts?: sdk_contact_t[];
};

// task responses
export enum sdk_task_generic_t {
  Passed = 1,
  Failed = 2
};

export enum sdk_task_set_emergency_t {
  Set = 1,
  Active = 2,
  NotActive = 3,
  Failed = 4
};

export enum sdk_task_set_internet_t {
  Activating = 1,
  Deactivating = 2,
  Active = 3,
  Inactive = 4
};

export enum sdk_task_send_message_t {
  Sending = 1,
  NoGPS = 2,
  NoRecipient = 3,
  Failed = 4
};
