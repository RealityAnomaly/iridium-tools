import { sdk_user_credentials_t } from "../types.ts";

export interface RemoveUserRequest {
    userCredentials: sdk_user_credentials_t;
    userName: string;
}
