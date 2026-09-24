export type IamUser = {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "STUDENT";
  enabled: boolean;
};

type CreateUserRequest = Omit<IamUser, "id" | "enabled"> & {password: string};

const apiGatewayUrl = import.meta.env.VITE_API_GATEWAY_URL ?? "";

async function request<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiGatewayUrl}${path}`, {
    ...init,
    headers: {Authorization: `Bearer ${accessToken}`, ...(init?.body ? {"Content-Type": "application/json"} : {}), ...init?.headers},
  });
  if (!response.ok) throw new Error((await response.text()) || `Request failed with status ${response.status}`);
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

export const listUsers = (token: string) => request<IamUser[]>("/api/admin/users", token);
export const createUser = (user: CreateUserRequest, token: string) => request<IamUser>("/api/admin/users", token, {method: "POST", body: JSON.stringify(user)});
export const setUserActive = (id: number, active: boolean, token: string) => request<IamUser>(`/api/admin/users/${id}/${active ? "activate" : "deactivate"}`, token, {method: "PATCH"});
export const deleteUser = (id: number, token: string) => request<void>(`/api/admin/users/${id}`, token, {method: "DELETE"});
