import type { ArenaChannel, ArenaBlock, ArenaUser } from "@/types";

const BASE_URL = "https://api.are.na/v3";

async function arenaFetch(path: string, token: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
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
    `/users/${userId}/contents?type=channels&page=${page}&per=${per}`,
    token
  );
  return {
    channels: data.contents ?? data.channels ?? data,
    total_pages: data.total_pages ?? 1,
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
    contents: data.contents ?? [],
    total_pages: data.total_pages ?? 1,
  };
}

export async function getBlockConnections(
  blockId: number,
  token: string
): Promise<ArenaChannel[]> {
  const data = await arenaFetch(`/blocks/${blockId}/connections`, token);
  return data.contents ?? data.connections ?? [];
}

export async function searchChannels(
  query: string,
  token: string,
  page = 1,
  per = 20
): Promise<ArenaChannel[]> {
  // v3 search is Premium-only, fall back to v2
  const res = await fetch(
    `https://api.are.na/v2/search/channels?q=${encodeURIComponent(query)}&page=${page}&per=${per}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Are.na API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.channels ?? [];
}
