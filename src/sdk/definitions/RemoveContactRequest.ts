import { sdk_user_credentials_t } from "../types.ts";

export interface RemoveContactRequest {
    userCredentials?: sdk_user_credentials_t;
    contactID?: number;
}
