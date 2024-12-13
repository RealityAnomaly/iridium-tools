import { sdk_user_credentials_t } from "../types.ts";

export interface AddNewContactRequest {
    userCredentials: sdk_user_credentials_t;
    name: string;
    number: string;
    isFavourite: boolean;
}
