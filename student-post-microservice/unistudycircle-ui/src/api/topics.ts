export type Topic = {
  topicId: number;
  topicName: string;
  topicDate: string;
  topicContent: string;
  studentId: number;
  studentName: string;
};

export type CreateTopicRequest = Omit<Topic, "topicId">;

const apiGatewayUrl = import.meta.env.VITE_API_GATEWAY_URL ?? "http://localhost:8080";

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

  return response.json() as Promise<T>;
}

export function listTopics() {
  return request<Topic[]>("/topic/all");
}

export function listMyTopics(studentName: string, accessToken: string) {
  return request<Topic[]>(`/topic/search/studentName/${encodeURIComponent(studentName)}`, accessToken);
}

export function createTopic(topic: CreateTopicRequest, accessToken: string) {
  return request<Topic>("/topic/create", accessToken, {
    method: "POST",
    body: JSON.stringify(topic),
  });
}
