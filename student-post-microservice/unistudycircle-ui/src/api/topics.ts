export type Topic = {
  topicId: number;
  topicName: string;
  topicDate: string;
  topicContent: string;
  studentId?: number;
  studentName?: string;
  ownerUsername?: string;
  visibility: "PUBLIC" | "PRIVATE";
};

export type CreateTopicRequest = Omit<Topic, "topicId">;

// Local development uses Vite's same-origin proxy; deployments can supply the gateway URL explicitly.
const apiGatewayUrl = import.meta.env.VITE_API_GATEWAY_URL ?? "";

async function request<T>(path: string, accessToken?: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiGatewayUrl}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

export function listTopics() {
  return request<Topic[]>("/topic/all");
}

export function listMyTopics(accessToken: string) {
  return request<Topic[]>("/topic/mine", accessToken);
}

export function createTopic(topic: CreateTopicRequest, accessToken: string) {
  return request<Topic>("/topic/create", accessToken, {
    method: "POST",
    body: JSON.stringify(topic),
  });
}

export function updateTopic(topicId: number, topic: CreateTopicRequest, accessToken: string) {
  return request<Topic>(`/topic/${topicId}`, accessToken, {
    method: "PUT",
    body: JSON.stringify(topic),
  });
}

export function deleteTopic(topicId: number, accessToken: string) {
  return request<void>(`/topic/${topicId}`, accessToken, {method: "DELETE"});
}

export function listAdminTopics(accessToken: string) {
  return request<Topic[]>("/topic/admin/all", accessToken);
}

export function getTopic(topicId: string, accessToken: string) {
  return request<Topic>(`/topic/${topicId}`, accessToken);
}
