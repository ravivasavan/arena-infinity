export interface ArenaChannel {
  id: number;
  title: string;
  slug: string;
  // v2: length, v3: counts.blocks
  length?: number;
  counts?: { blocks?: number; channels?: number; connections?: number };
  // v2: status, v3: visibility
  status?: "public" | "closed" | "private";
  visibility?: "public" | "closed" | "private";
  // v2: user, v3: owner
  user?: { id: number; slug: string; username: string };
  owner?: { id: number; slug: string; name?: string; username?: string };
}

export interface ArenaBlock {
  id: number;
  title: string | null;
  // v2: class, v3: type
  class?: "Image" | "Text" | "Link" | "Media" | "Attachment" | "Embed";
  type?: "Image" | "Text" | "Link" | "Attachment" | "Embed" | "PendingBlock";
  content: string | null;
  // v2 image format
  image?: {
    thumb?: { url: string };
    display?: { url: string };
    // v3 image format
    small?: { src: string; src_2x?: string };
    medium?: { src: string; src_2x?: string };
    large?: { src: string; src_2x?: string };
    square?: { src: string; src_2x?: string };
  } | null;
  source?: { url: string } | null;
  embed?: { url: string; type: string; html?: string } | null;
  description?: string | null;
  connections?: ArenaChannel[];
  connected_at?: string;
  connection_count?: number;
}

export interface ArenaUser {
  id: number;
  slug: string;
  // v2: username, v3: name
  username?: string;
  name?: string;
  avatar?: string;
  channel_count?: number;
  counts?: { channels?: number };
}

// Helper accessors
export function getBlockCount(ch: ArenaChannel): number {
  return ch.counts?.blocks ?? ch.length ?? 0;
}

export function getChannelStatus(ch: ArenaChannel): string {
  return ch.visibility ?? ch.status ?? "public";
}

export function getChannelOwnerSlug(ch: ArenaChannel): string | undefined {
  return ch.user?.slug ?? ch.owner?.slug;
}

export function getChannelOwnerName(ch: ArenaChannel): string | undefined {
  return ch.user?.username ?? ch.owner?.name ?? ch.owner?.username;
}

export function getBlockType(block: ArenaBlock): string {
  return block.class ?? block.type ?? "Attachment";
}

export function getBlockImageUrl(block: ArenaBlock): string | undefined {
  return block.image?.display?.url ?? block.image?.medium?.src ?? block.image?.thumb?.url ?? block.image?.small?.src;
}

export function getBlockThumbUrl(block: ArenaBlock): string | undefined {
  return block.image?.thumb?.url ?? block.image?.small?.src ?? block.image?.display?.url ?? block.image?.medium?.src;
}

export type GraphNodeType = "channel" | "block";

export interface ChannelNodeData {
  [key: string]: unknown;
  type: "channel";
  channel: ArenaChannel;
  expanded: boolean;
  loading: boolean;
  previewBlocks?: ArenaBlock[];
  color?: string;
  loadedCount?: number;
  totalBlocks?: number;
}

export interface BlockNodeData {
  [key: string]: unknown;
  type: "block";
  block: ArenaBlock;
  expanded: boolean;
  loading: boolean;
  color?: string;
}

export type GraphNodeData = ChannelNodeData | BlockNodeData;
