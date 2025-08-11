export interface KeyRequest {
  fastStartName: string;
}

export interface Registry {
  fastStarts: {
    [fastStartName: string]: {
      fastStart: string;
      author: string;
      type: string;
      versions: string[];
    };
  };
}
