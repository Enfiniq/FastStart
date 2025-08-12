import { RegistryPackage } from "@/types/packages";
import { NextRequest, NextResponse } from "next/server";
import { validateFastKey } from "./fastKeys";

export function checkPackageAuth(
  request: NextRequest,
  packageName: string,
  packages: Record<string, RegistryPackage>
) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      {
        error:
          "Missing or invalid authorization header. Expected: Bearer <API_KEY>",
      },
      { status: 401 }
    );
  }

  const apiKey = authHeader.replace("Bearer ", "");
  const existingPackage = packages[packageName];

  if (!existingPackage) {
    return NextResponse.json(
      { error: `Package '${packageName}' not found` },
      { status: 404 }
    );
  }

  if (!validateFastKey(packageName, apiKey)) {
    return NextResponse.json(
      { error: "Invalid API key for this package" },
      { status: 403 }
    );
  }

  return null;
}
