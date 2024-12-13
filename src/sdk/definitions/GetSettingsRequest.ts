import { sdk_configuration_requestList_t, sdk_user_credentials_t } from "../types.ts";

export interface GetSettingsRequest {
    userCredentials: sdk_user_credentials_t;
    reqList: sdk_configuration_requestList_t;
}
