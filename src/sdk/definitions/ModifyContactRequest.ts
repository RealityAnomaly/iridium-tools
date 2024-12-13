import { sdk_contact_t, sdk_user_credentials_t } from "../types.ts";

export interface ModifyContactRequest {
    userCredentials: sdk_user_credentials_t;
    contact: sdk_contact_t;
}
