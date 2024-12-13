import { sdk_task_requestList_t, sdk_user_credentials_t } from "../types.ts";

export interface PerformTaskRequest {
    userCredentials: sdk_user_credentials_t;
    taskList: sdk_task_requestList_t;
}
