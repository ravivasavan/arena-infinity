import type { ArenaChannel, ArenaBlock, ArenaUser } from "@/types";

const BASE_URL = "https://api.are.na/v3";

async function arenaFetch(path: string, token: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`Are.na API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getMe(token: string): Promise<ArenaUser> {
  return arenaFetch("/me", token);
}

export async function getUserChannels(
  userId: number,
  token: string,
  page = 1,
  per = 50
): Promise<{ channels: ArenaChannel[]; total_pages: number }> {
  const data = await arenaFetch(
    `/users/${userId}/contents?type=Channel&page=${page}&per=${per}`,
    token
  );
  return {
    channels: data.data ?? data.contents ?? data.channels ?? [],
    total_pages: data.meta?.total_pages ?? data.total_pages ?? 1,
  };
}

export async function getChannelContents(
  slug: string,
  token: string,
  page = 1,
  per = 50
): Promise<{ contents: ArenaBlock[]; total_pages: number }> {
  const data = await arenaFetch(
    `/channels/${slug}/contents?page=${page}&per=${per}`,
    token
  );
  return {
    contents: data.data ?? data.contents ?? [],
    total_pages: data.meta?.total_pages ?? data.total_pages ?? 1,
  };
}

export async function getBlockConnections(
  blockId: number,
  token: string
): Promise<ArenaChannel[]> {
  const data = await arenaFetch(`/blocks/${blockId}/connections`, token);
  return data.data ?? data.contents ?? data.connections ?? [];
}

export async function searchChannels(
  query: string,
  token: string,
  page = 1,
  per = 20
): Promise<ArenaChannel[]> {
  const data = await arenaFetch(
    `/search?query=${encodeURIComponent(query)}&type=Channel&page=${page}&per=${per}`,
    token
  );
  return data.data ?? [];
}

export async function connectToChannel(
  channelSlug: string,
  sourceId: number,
  sourceType: "Block" | "Channel",
  token: string
): Promise<void> {
  await arenaFetch(`/channels/${channelSlug}/connections`, token, {
    method: "POST",
    body: JSON.stringify({
      connectable_type: sourceType,
      connectable_id: sourceId,
    }),
  });
}
