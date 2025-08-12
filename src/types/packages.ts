export interface PackageData {
  name: string;
  fastStart: string;
  versions: string[];
  type: string;
  author: string;
}

export interface RegistryPackage extends PackageData {
  apiKey?: string;
  createdAt?: string;
  updatedAt?: string;
}
