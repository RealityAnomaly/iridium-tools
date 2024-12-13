import { sdk_status_request_t, sdk_user_credentials_t } from "../types.ts";

export interface GetStatusRequest {
    userCredentials: sdk_user_credentials_t;
    request: sdk_status_request_t;
}
