import { sdk_configuration_setRequest_list_t, sdk_user_credentials_t } from "../types.ts";

export interface SetSettingsRequest {
    userCredentials: sdk_user_credentials_t;
    setList: sdk_configuration_setRequest_list_t;
}
