import { NextRequest, NextResponse } from "next/server";
import { getRegistry, updateRegistry, getRawRegistry } from "@/utils/registry";
import { validateFastKey } from "@/utils/fastKeys";
import { PackageData, RegistryPackage } from "@/types/packages";
import { checkPackageAuth } from "@/utils/packages";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fastStartName = searchParams.get("fastStartName");
    const type = searchParams.get("type");
    const author = searchParams.get("author");
    const url = searchParams.get("url");
    const version = searchParams.get("version");

    const registryData = await getRawRegistry();
    if (!registryData) {
      return NextResponse.json(
        { error: "Failed to fetch packages" },
        { status: 500 }
      );
    }

    const packages = registryData.fastStarts || {};
    let filteredPackages = Object.entries(packages);

    if (fastStartName) {
      filteredPackages = filteredPackages.filter(([name]) =>
        name.toLowerCase().includes(fastStartName.toLowerCase())
      );
    }

    if (type) {
      filteredPackages = filteredPackages.filter(([, pkg]) => {
        const typedPkg = pkg as RegistryPackage;
        return typedPkg.type?.toLowerCase() === type.toLowerCase();
      });
    }

    if (author) {
      filteredPackages = filteredPackages.filter(([, pkg]) => {
        const typedPkg = pkg as RegistryPackage;
        return typedPkg.author?.toLowerCase().includes(author.toLowerCase());
      });
    }

    if (url) {
      filteredPackages = filteredPackages.filter(([, pkg]) => {
        const typedPkg = pkg as RegistryPackage;
        return typedPkg.fastStart?.toLowerCase().includes(url.toLowerCase());
      });
    }

    if (version) {
      filteredPackages = filteredPackages.filter(([, pkg]) => {
        const typedPkg = pkg as RegistryPackage;
        return typedPkg.versions?.includes(version);
      });
    }

    const publicPackages = Object.fromEntries(
      filteredPackages.map(([name, pkg]) => {
        const typedPkg = pkg as RegistryPackage;
        return [
          name,
          {
            name: typedPkg.name,
            fastStart: typedPkg.fastStart,
            versions: typedPkg.versions,
            type: typedPkg.type,
            author: typedPkg.author,
            createdAt: typedPkg.createdAt,
            updatedAt: typedPkg.updatedAt,
          },
        ];
      })
    );

    return NextResponse.json({
      success: true,
      packages: publicPackages,
      total: Object.keys(publicPackages).length,
    });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
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
    const packageData: PackageData = await request.json();

    if (
      !packageData.name ||
      !packageData.fastStart ||
      !packageData.versions ||
      !packageData.type ||
      !packageData.author
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, fastStart, versions, type, author",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(packageData.versions) ||
      packageData.versions.length === 0
    ) {
      return NextResponse.json(
        { error: "Versions must be a non-empty array" },
        { status: 400 }
      );
    }

    const registryResponse = await getRegistry();
    if (!registryResponse) {
      return NextResponse.json(
        { error: "Failed to access registry" },
        { status: 500 }
      );
    }

    const { content: registry, sha } = registryResponse;
    const packages = registry.fastStarts || {};

    const existingPackage = packages[packageData.name];
    if (existingPackage && !validateFastKey(packageData.name, apiKey)) {
      return NextResponse.json(
        { error: "Invalid API key for this package" },
        { status: 403 }
      );
    }

    const timestamp = new Date().toISOString();

    const publicPackageData = {
      fastStart: packageData.fastStart,
      versions: packageData.versions,
      type: packageData.type,
      author: packageData.author,
    };

    packages[packageData.name] = publicPackageData;

    const updatedRegistry = { ...registry, fastStarts: packages };
    const updateResult = await updateRegistry(updatedRegistry, sha);

    if (!updateResult) {
      return NextResponse.json(
        { error: "Failed to update registry" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: existingPackage
        ? "Package updated successfully"
        : "Package created successfully",
      package: {
        name: packageData.name,
        fastStart: packageData.fastStart,
        versions: packageData.versions,
        type: packageData.type,
        author: packageData.author,
        updatedAt: timestamp,
      },
    });
  } catch (error) {
    console.error("Error creating/updating package:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const packageName = searchParams.get("name");

    if (!packageName) {
      return NextResponse.json(
        { error: "Missing required query parameter: name" },
        { status: 400 }
      );
    }

    const registryResponse = await getRegistry();
    if (!registryResponse) {
      return NextResponse.json(
        { error: "Failed to access registry" },
        { status: 500 }
      );
    }

    const { content: registry, sha } = registryResponse;
    const packages = registry.fastStarts || {};

    const authError = checkPackageAuth(request, packageName, packages);
    if (authError) {
      return authError;
    }

    delete packages[packageName];

    const updatedRegistry = { ...registry, fastStarts: packages };
    const updateResult = await updateRegistry(updatedRegistry, sha);

    if (!updateResult) {
      return NextResponse.json(
        { error: "Failed to update registry" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Package '${packageName}' deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
