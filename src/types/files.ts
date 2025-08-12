export interface FileItem {
  path?: string;
  target: string;
  content?: string;
  absolute?: string;
}

export interface FileResponse {
  files: FileItem[];
}

export interface ProcessedFile {
  target: string;
  content: string;
}
