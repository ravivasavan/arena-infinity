export interface ArenaChannel {
  id: number;
  title: string;
  slug: string;
  length: number;
  status: "public" | "closed" | "private";
  user: {
    id: number;
    slug: string;
    username: string;
  };
}

export interface ArenaBlock {
  id: number;
  title: string | null;
  class: "Image" | "Text" | "Link" | "Media" | "Attachment";
  content: string | null;
  image?: {
    thumb?: { url: string };
    display?: { url: string };
  } | null;
  source?: { url: string } | null;
  connections?: ArenaChannel[];
}

export interface ArenaUser {
  id: number;
  slug: string;
  username: string;
  avatar: string;
  channel_count: number;
}

export type GraphNodeType = "channel" | "block";

export interface ChannelNodeData {
  [key: string]: unknown;
  type: "channel";
  channel: ArenaChannel;
  expanded: boolean;
  loading: boolean;
}

export interface BlockNodeData {
  [key: string]: unknown;
  type: "block";
  block: ArenaBlock;
  expanded: boolean;
  loading: boolean;
}

export type GraphNodeData = ChannelNodeData | BlockNodeData;
