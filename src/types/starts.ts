export interface StartsRequest {
  limit?: number;
  offset?: number;
  type?: "faststart" | "author";
  scope?: string;
}

export interface StartsResponse {
  success: boolean;
  data: string[];
  total: number;
  limit: number;
  offset: number;
  type: string;
}

export interface PackageInfo {
  author?: string;
  [key: string]: unknown;
}
