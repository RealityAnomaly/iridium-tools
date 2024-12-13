// deno-lint-ignore-file no-explicit-any ban-types
import { GetVersionResponse } from "../definitions/GetVersionResponse.ts";
import { GetUserDetailsRequest } from "../definitions/GetUserDetailsRequest.ts";
import { GetUserDetailsResponse } from "../definitions/GetUserDetailsResponse.ts";
import { GetStatusRequest } from "../definitions/GetStatusRequest.ts";
import { GetStatusResponse } from "../definitions/GetStatusResponse.ts";
import { GetSettingsRequest } from "../definitions/GetSettingsRequest.ts";
import { GetSettingsResponse } from "../definitions/GetSettingsResponse.ts";
import { SetSettingsRequest } from "../definitions/SetSettingsRequest.ts";
import { SetSettingsResponse } from "../definitions/SetSettingsResponse.ts";
import { PerformTaskRequest } from "../definitions/PerformTaskRequest.ts";
import { PerformTaskResponse } from "../definitions/PerformTaskResponse.ts";
import { GetUserListRequest } from "../definitions/GetUserListRequest.ts";
import { GetUserListResponse } from "../definitions/GetUserListResponse.ts";
import { AddModifyUserRequest } from "../definitions/AddModifyUserRequest.ts";
import { AddModifyUserResponse } from "../definitions/AddModifyUserResponse.ts";
import { RemoveUserRequest } from "../definitions/RemoveUserRequest.ts";
import { RemoveUserResponse } from "../definitions/RemoveUserResponse.ts";
import { GetContactListRequest } from "../definitions/GetContactListRequest.ts";
import { GetContactListResponse } from "../definitions/GetContactListResponse.ts";
import { AddNewContactRequest } from "../definitions/AddNewContactRequest.ts";
import { AddNewContactResponse } from "../definitions/AddNewContactResponse.ts";
import { ModifyContactRequest } from "../definitions/ModifyContactRequest.ts";
import { ModifyContactResponse } from "../definitions/ModifyContactResponse.ts";
import { RemoveContactRequest } from "../definitions/RemoveContactRequest.ts";
import { RemoveContactResponse } from "../definitions/RemoveContactResponse.ts";
import { GetTransceiverInfoResponse } from "../definitions/GetTransceiverInfoResponse.ts";

export interface SdkSoap {
    getVersion(getVersionRequest: {}, callback: (err: any, result: GetVersionResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    getUserDetails(getUserDetailsRequest: GetUserDetailsRequest, callback: (err: any, result: GetUserDetailsResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    getStatus(getStatusRequest: GetStatusRequest, callback: (err: any, result: GetStatusResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    getSettings(getSettingsRequest: GetSettingsRequest, callback: (err: any, result: GetSettingsResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    setSettings(setSettingsRequest: SetSettingsRequest, callback: (err: any, result: SetSettingsResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    performTask(performTaskRequest: PerformTaskRequest, callback: (err: any, result: PerformTaskResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    getUserList(getUserListRequest: GetUserListRequest, callback: (err: any, result: GetUserListResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    addModifyUser(addModifyUserRequest: AddModifyUserRequest, callback: (err: any, result: AddModifyUserResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    removeUser(removeUserRequest: RemoveUserRequest, callback: (err: any, result: RemoveUserResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    getContactList(getContactListRequest: GetContactListRequest, callback: (err: any, result: GetContactListResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    addNewContact(addNewContactRequest: AddNewContactRequest, callback: (err: any, result: AddNewContactResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    modifyContact(modifyContactRequest: ModifyContactRequest, callback: (err: any, result: ModifyContactResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    removeContact(removeContactRequest: RemoveContactRequest, callback: (err: any, result: RemoveContactResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    getTransceiverInfo(getTransceiverInfoRequest: {}, callback: (err: any, result: GetTransceiverInfoResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}
