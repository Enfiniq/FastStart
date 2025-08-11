import { NextRequest, NextResponse } from "next/server";
import { generateFastKey, validateFastKey } from "@/utils/fastKeys";
import { getRawRegistry } from "@/utils/registry";
import { KeyRequest, Registry } from "@/types/key";

export async function POST(request: NextRequest) {
  try {
    const body: KeyRequest = await request.json();
    const { fastStartName } = body;

    if (
      !fastStartName ||
      typeof fastStartName !== "string" ||
      fastStartName.trim().length === 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid fastStart name",
          message: "A valid fastStart name is required",
        },
        { status: 400 }
      );
    }

    const fastStartNameRegex =
      /^(?:@[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)?|[a-zA-Z0-9_-]+)$/;
    if (!fastStartNameRegex.test(fastStartName)) {
      return NextResponse.json(
        {
          error: "Invalid fastStart name format",
          message:
            "FastStart name can only contain letters, numbers, hyphens, and underscores, optionally prefixed with @author/ or as a scope @author",
        },
        { status: 400 }
      );
    }

    if (fastStartName.startsWith("@") && fastStartName.includes("/")) {
      const authHeader = request.headers.get("authorization");
      const scopeKey = authHeader?.split(" ")[1];
      const scopeName = fastStartName.split("/")[0];

      if (!scopeKey) {
        return NextResponse.json(
          {
            error: "Authorization required for scoped package",
            message: `Creating a key for '${fastStartName}' requires the API key for the '${scopeName}' scope in the Authorization header.`,
          },
          { status: 401 }
        );
      }

      if (!validateFastKey(scopeName, scopeKey)) {
        return NextResponse.json(
          {
            error: "Invalid scope API key",
            message: `The provided API key is not valid for the '${scopeName}' scope.`,
          },
          { status: 403 }
        );
      }
    }

    try {
      const registry: Registry = await getRawRegistry();

      if (
        registry &&
        registry.fastStarts &&
        registry.fastStarts[fastStartName]
      ) {
        return NextResponse.json(
          {
            error: "FastStart name already exists",
            message: `The fastStart name '${fastStartName}' is already registered. Each fastStart name can only have one FAST key to prevent naming conflicts. If you lost your FAST key, please contact support for assistance.`,
            existingFastStart: {
              name: fastStartName,
              fastStart: registry.fastStarts[fastStartName].fastStart,
              versions: registry.fastStarts[fastStartName].versions,
            },
          },
          { status: 409 }
        );
      }
    } catch (error: unknown) {
      console.error("Error fetching registry:", error);
    }

    const fastKey = generateFastKey(fastStartName);

    return NextResponse.json({
      success: true,
      fastStartName,
      fastKey,
      message: `FAST key generated for fastStart: ${fastStartName}`,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to generate FAST key",
      },
      { status: 500 }
    );
  }
}
