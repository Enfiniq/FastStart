import { NextRequest, NextResponse } from "next/server";
import { validateFastKey } from "./fastKeys";

export function checkAuth(
  request: NextRequest,
  packageName?: string
): NextResponse | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "FastStartKey required in Authorization header" },
      { status: 401 }
    );
  }

  const key = authHeader.split(" ")[1];

  if (packageName) {
    if (packageName.startsWith("@") && packageName.includes("/")) {
      const scopeName = packageName.split("/")[0];
      if (!validateFastKey(scopeName, key)) {
        return NextResponse.json(
          { error: `Invalid FastStartKey for scope ${scopeName}` },
          { status: 401 }
        );
      }
    } else {
      if (!validateFastKey(packageName, key)) {
        return NextResponse.json(
          { error: "Invalid FastStartKey for this package" },
          { status: 401 }
        );
      }
    }
  }

  return null;
}