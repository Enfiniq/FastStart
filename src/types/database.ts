export interface FastStartRecord {
  id?: number;
  name: string;
  fastStart: string;
  author: string;
  type: string;
  versions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseResponse {
  success: boolean;
  data?: FastStartRecord[];
  total?: number;
  limit?: number;
  offset?: number;
  message?: string;
  package?: string;
  error?: string;
}
