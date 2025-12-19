// utils/ApiRequest.js
const host = import.meta.env.VITE_API_URL || "http://localhost:5559";

export const UserEndPoint = `${host}/users`;
export const AuthEndPoint = `${host}/auth`;
export const AuthAzureEndPoint = `${host}/api/auth`;
export const ActivityLogEndPoint = `${host}/api/activities`;
export const TokenAndAuthEndPoint = `${host}/auth/tokens`;
export const CourseEndPoint = `${host}/courses`;

export const SystemBackupEndPoint = `${host}/tmf-api/productCatalogManagement/v5/admin/backup/now`;