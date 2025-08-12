import { NextRequest, NextResponse } from "next/server";
import { getRawRegistry } from "@/utils/registry";
import axios from "axios";
import { FileResponse, ProcessedFile } from "@/types/files";
import { getLatestVersion, parseVersionedName } from "@/utils/files";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fastStartParam = searchParams.get("fastStart");

    if (!fastStartParam) {
      return NextResponse.json(
        {
          error: "Missing fastStart parameter",
          message: "fastStart query parameter is required",
        },
        { status: 400 }
      );
    }

    const { name, version } = parseVersionedName(fastStartParam);

    const registryData = await getRawRegistry();
    if (!registryData) {
      return NextResponse.json(
        { error: "Failed to fetch registry" },
        { status: 500 }
      );
    }

    const packages = registryData.fastStarts || {};
    const packageInfo = packages[name];

    if (!packageInfo) {
      return NextResponse.json(
        { error: `FastStart '${name}' not found` },
        { status: 404 }
      );
    }

    let targetVersion: string;
    if (version) {
      if (version === "latest") {
        targetVersion = getLatestVersion(packageInfo.versions);
      } else if (packageInfo.versions.includes(version)) {
        targetVersion = version;
      } else {
        return NextResponse.json(
          { error: `Version '${version}' not found for '${name}'` },
          { status: 404 }
        );
      }
    } else {
      targetVersion = getLatestVersion(packageInfo.versions);
    }

    let fetchUrl: string;
    if (packageInfo.fastStart.startsWith("!")) {
      fetchUrl = packageInfo.fastStart.substring(1);

      try {
        const response = await axios.get(fetchUrl);
        const directContent =
          typeof response.data === "string"
            ? response.data
            : JSON.stringify(response.data);

        return NextResponse.json([
          {
            target: `${name}-content`,
            content: directContent,
          },
        ]);
      } catch (error) {
        console.error(`Failed to fetch direct URL ${fetchUrl}:`, error);
        return NextResponse.json(
          { error: `Failed to fetch content from ${fetchUrl}` },
          { status: 500 }
        );
      }
    } else {
      fetchUrl = `${packageInfo.fastStart}@${targetVersion}.json`;
    }

    const response = await axios.get(fetchUrl);
    const fileData: FileResponse = response.data;

    if (!fileData.files || !Array.isArray(fileData.files)) {
      return NextResponse.json(
        { error: "Invalid file structure in fetched content" },
        { status: 500 }
      );
    }

    const processedFiles: ProcessedFile[] = [];

    for (const file of fileData.files) {
      if (file.content) {
        processedFiles.push({
          target: file.target,
          content: file.content,
        });
      } else if (file.absolute) {
        try {
          const absoluteResponse = await axios.get(file.absolute);
          processedFiles.push({
            target: file.target,
            content:
              typeof absoluteResponse.data === "string"
                ? absoluteResponse.data
                : JSON.stringify(absoluteResponse.data),
          });
        } catch (error) {
          console.error(
            `Failed to fetch absolute URL ${file.absolute}:`,
            error
          );
          return NextResponse.json(
            { error: `Failed to fetch content from ${file.absolute}` },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: `File ${file.target} has no content or absolute URL` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(processedFiles);
  } catch (error) {
    console.error("Error in GET /api/files:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
