import { sdk_user_credentials_t, sdk_user_t } from "../types.ts";

export interface AddModifyUserRequest {
    userCredentials: sdk_user_credentials_t;
    user: sdk_user_t;
};
