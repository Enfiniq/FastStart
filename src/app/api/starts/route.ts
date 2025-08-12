import { NextRequest, NextResponse } from "next/server";
import { getRawRegistry } from "@/utils/registry";
import { PackageInfo, StartsRequest, StartsResponse } from "@/types/starts";

export async function POST(request: NextRequest) {
  try {
    const body: StartsRequest = await request.json();
    const { limit = 50, offset = 0, type = "author", scope } = body;

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 100" },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: "Offset must be non-negative" },
        { status: 400 }
      );
    }

    if (type !== "faststart" && type !== "author") {
      return NextResponse.json(
        { error: "Type must be either 'faststart' or 'author'" },
        { status: 400 }
      );
    }

    const registryData = await getRawRegistry();
    if (!registryData) {
      return NextResponse.json(
        { error: "Failed to fetch registry" },
        { status: 500 }
      );
    }

    const packages = registryData.fastStarts || {};
    let results: string[] = [];

    if (scope !== undefined) {
      if (scope === "@") {
        const scopes = new Set<string>();
        Object.keys(packages).forEach((packageName) => {
          if (packageName.startsWith("@") && packageName.includes("/")) {
            const scopeName = packageName.split("/")[0];
            scopes.add(scopeName);
          }
        });
        results = Array.from(scopes).sort();
      } else if (scope.startsWith("@")) {
        if (scope.includes("/")) {
          return NextResponse.json(
            {
              error:
                "Scope should be just the scope name (e.g., '@org'), not a full package name",
            },
            { status: 400 }
          );
        }

        const scopePackages = Object.keys(packages).filter((packageName) =>
          packageName.startsWith(scope + "/")
        );

        if (type === "faststart") {
          results = scopePackages.sort();
        } else {
          const authors = new Set<string>();
          scopePackages.forEach((packageName) => {
            const pkg = packages[packageName] as PackageInfo;
            if (pkg && pkg.author) {
              authors.add(pkg.author);
            }
          });
          results = Array.from(authors).sort();
        }
      } else {
        return NextResponse.json(
          { error: "Scope must start with '@'" },
          { status: 400 }
        );
      }
    } else {
      if (type === "faststart") {
        results = Object.keys(packages).sort();
      } else {
        const authors = new Set<string>();
        Object.values(packages).forEach((pkg) => {
          const packageInfo = pkg as PackageInfo;
          if (packageInfo && packageInfo.author) {
            authors.add(packageInfo.author);
          }
        });
        results = Array.from(authors).sort();
      }
    }

    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    const response: StartsResponse = {
      success: true,
      data: paginatedResults,
      total,
      limit,
      offset,
      type: scope === "@" ? "scopes" : type,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in starts route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
