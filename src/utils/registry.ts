import axios from "axios";

const getHeaders = () => {
  const secret = process.env.FASTSTART_REGISTRY_ACCESS_SECRET_KEY;
  if (!secret) {
    throw new Error(
      "FASTSTART_REGISTRY_ACCESS_SECRET_KEY is not defined in environment variables."
    );
  }
  return {
    Authorization: `Bearer ${secret}`,
  };
};

export async function getRegistry() {
  try {
    console.log("Fetching registry data from GitHub");
    const response = await axios.get(
      `${process.env.FASTSTART_BASE_URL}/api/registry?action=getRegistry`,
      { headers: getHeaders() }
    );

    return response.data;
  } catch {
    return null;
  }
}

export async function getRawRegistry() {
  try {
    console.log("Fetching raw registry data from GitHub");
    const response = await axios.get(
      `${process.env.FASTSTART_BASE_URL}/api/registry`,
      { headers: getHeaders() }
    );

    return response.data;
  } catch {
    return null;
  }
}

export async function updateRegistry(registry: object, sha: string) {
  try {
    const response = await axios.put(
      `${process.env.FASTSTART_BASE_URL}/api/registry`,
      {
        action: "updateRegistry",
        registry,
        sha,
      },
      { headers: getHeaders() }
    );

    return response.data;
  } catch {
    return null;
  }
}

export async function deletePackageFromRegistry(packageName: string) {
  try {
    const response = await axios.delete(
      `${
        process.env.FASTSTART_BASE_URL
      }/api/registry?packageName=${encodeURIComponent(packageName)}`,
      { headers: getHeaders() }
    );

    return response.data;
  } catch {
    return null;
  }
}
