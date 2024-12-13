// deno-lint-ignore-file no-explicit-any
import { Client as SoapClient, createClientAsync as soapCreateClientAsync, IExOptions as ISoapExOptions } from "soap";
import { GetVersionResponse } from "./definitions/GetVersionResponse.ts";
import { GetUserDetailsRequest } from "./definitions/GetUserDetailsRequest.ts";
import { GetUserDetailsResponse } from "./definitions/GetUserDetailsResponse.ts";
import { GetStatusRequest } from "./definitions/GetStatusRequest.ts";
import { GetStatusResponse } from "./definitions/GetStatusResponse.ts";
import { GetSettingsRequest } from "./definitions/GetSettingsRequest.ts";
import { GetSettingsResponse } from "./definitions/GetSettingsResponse.ts";
import { SetSettingsRequest } from "./definitions/SetSettingsRequest.ts";
import { SetSettingsResponse } from "./definitions/SetSettingsResponse.ts";
import { PerformTaskRequest } from "./definitions/PerformTaskRequest.ts";
import { PerformTaskResponse } from "./definitions/PerformTaskResponse.ts";
import { GetUserListRequest } from "./definitions/GetUserListRequest.ts";
import { GetUserListResponse } from "./definitions/GetUserListResponse.ts";
import { AddModifyUserRequest } from "./definitions/AddModifyUserRequest.ts";
import { AddModifyUserResponse } from "./definitions/AddModifyUserResponse.ts";
import { RemoveUserRequest } from "./definitions/RemoveUserRequest.ts";
import { RemoveUserResponse } from "./definitions/RemoveUserResponse.ts";
import { GetContactListRequest } from "./definitions/GetContactListRequest.ts";
import { GetContactListResponse } from "./definitions/GetContactListResponse.ts";
import { AddNewContactRequest } from "./definitions/AddNewContactRequest.ts";
import { AddNewContactResponse } from "./definitions/AddNewContactResponse.ts";
import { ModifyContactRequest } from "./definitions/ModifyContactRequest.ts";
import { ModifyContactResponse } from "./definitions/ModifyContactResponse.ts";
import { RemoveContactRequest } from "./definitions/RemoveContactRequest.ts";
import { RemoveContactResponse } from "./definitions/RemoveContactResponse.ts";
import { GetTransceiverInfoResponse } from "./definitions/GetTransceiverInfoResponse.ts";
import { Sdk } from "./services/Sdk.ts";

export interface SdkClient extends SoapClient {
    Sdk: Sdk;
    getVersionAsync(getVersionRequest: null, options?: ISoapExOptions): Promise<[result: GetVersionResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    getUserDetailsAsync(getUserDetailsRequest: GetUserDetailsRequest, options?: ISoapExOptions): Promise<[result: GetUserDetailsResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    getStatusAsync(getStatusRequest: GetStatusRequest, options?: ISoapExOptions): Promise<[result: GetStatusResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    getSettingsAsync(getSettingsRequest: GetSettingsRequest, options?: ISoapExOptions): Promise<[result: GetSettingsResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    setSettingsAsync(setSettingsRequest: SetSettingsRequest, options?: ISoapExOptions): Promise<[result: SetSettingsResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    performTaskAsync(performTaskRequest: PerformTaskRequest, options?: ISoapExOptions): Promise<[result: PerformTaskResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    getUserListAsync(getUserListRequest: GetUserListRequest, options?: ISoapExOptions): Promise<[result: GetUserListResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    addModifyUserAsync(addModifyUserRequest: AddModifyUserRequest, options?: ISoapExOptions): Promise<[result: AddModifyUserResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    removeUserAsync(removeUserRequest: RemoveUserRequest, options?: ISoapExOptions): Promise<[result: RemoveUserResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    getContactListAsync(getContactListRequest: GetContactListRequest, options?: ISoapExOptions): Promise<[result: GetContactListResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    addNewContactAsync(addNewContactRequest: AddNewContactRequest, options?: ISoapExOptions): Promise<[result: AddNewContactResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    modifyContactAsync(modifyContactRequest: ModifyContactRequest, options?: ISoapExOptions): Promise<[result: ModifyContactResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    removeContactAsync(removeContactRequest: RemoveContactRequest, options?: ISoapExOptions): Promise<[result: RemoveContactResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    getTransceiverInfoAsync(getTransceiverInfoRequest: null, options?: ISoapExOptions): Promise<[result: GetTransceiverInfoResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
}

/** Create SdkClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<SdkClient> {
    return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
