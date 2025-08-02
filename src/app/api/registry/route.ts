import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosInstance } from "axios";

const GITHUB_API_URL = "https://api.github.com";
let octokit: AxiosInstance;
let REPO_OWNER: string | undefined;
let REPO_NAME: string | undefined;

function ensureInitialized() {
  if (!octokit || !REPO_OWNER || !REPO_NAME) {
    const GITHUB_TOKEN = process.env.FASTSTART_GITHUB_TOKEN;
    REPO_OWNER = process.env.FASTSTART_REPO_OWNER || "Enfiniq";
    REPO_NAME = process.env.FASTSTART_REPO_NAME || "FastStart-Registry";

    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
      throw new Error("GitHub token or repository details are not configured.");
    }

    octokit = axios.create({
      baseURL: GITHUB_API_URL,
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
  }
}

const getFile = async (path: string) => {
  ensureInitialized();
  try {
    const response = await octokit.get(
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`
    );
    return response.data;
  } catch (error: unknown) {
    return null;
  }
};

const updateFile = async (path: string, content: string, sha: string) => {
  ensureInitialized();
  try {
    const response = await octokit.put(
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
      {
        message: `Update ${path}`,
        content: Buffer.from(content).toString("base64"),
        sha,
      }
    );
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

const CENTRAL_REGISTRY_PATH = "registry.json";

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.FASTSTART_REGISTRY_ACCESS_SECRET_KEY;

  if (!secret) {
    return NextResponse.json(
      { error: "Registry access secret not configured on server." },
      { status: 500 }
    );
  }

  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) {
    return authError;
  }
  ensureInitialized();
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "getRegistry") {
      const file = await getFile(CENTRAL_REGISTRY_PATH);
      if (!file) {
        return NextResponse.json(
          { error: "Registry not found" },
          { status: 404 }
        );
      }
      const content = Buffer.from(file.content, "base64").toString();
      return NextResponse.json({ content: JSON.parse(content), sha: file.sha });
    }
    const rawContentUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${CENTRAL_REGISTRY_PATH}`;
    const response = await axios.get(rawContentUrl);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) {
    return authError;
  }
  ensureInitialized();
  try {
    const { action, registry, sha } = await request.json();

    if (action === "updateRegistry") {
      if (!registry || !sha) {
        return NextResponse.json(
          { error: "Missing registry or sha" },
          { status: 400 }
        );
      }
      const content = JSON.stringify(registry, null, 2);
      const response = await updateFile(CENTRAL_REGISTRY_PATH, content, sha);
      return NextResponse.json(response);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
