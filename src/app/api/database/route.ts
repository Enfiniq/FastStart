import { NextRequest, NextResponse } from "next/server";
import { supabase, FastStartRecord } from "@/lib/supabase";
import { getRegistry, updateRegistry } from "@/utils/registry";
import { checkAuth } from "@/utils/database";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  const authError = checkAuth(request, name || undefined);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const author = searchParams.get("author");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("faststarts")
      .select("*")
      .order("created_at", { ascending: false });

    if (name) {
      query = query.ilike("name", `%${name}%`);
    }
    if (author) {
      query = query.ilike("author", `%${author}%`);
    }
    if (type) {
      query = query.eq("type", type);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch data from database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Package name is required" },
        { status: 400 }
      );
    }

    const authError = checkAuth(request, name);
    if (authError) return authError;

    const { data: dbData, error: dbError } = await supabase
      .from("faststarts")
      .select("*")
      .eq("name", name)
      .single();

    if (dbError || !dbData) {
      return NextResponse.json(
        { error: "Package not found in database" },
        { status: 404 }
      );
    }

    const registryResponse = await getRegistry();
    if (!registryResponse) {
      return NextResponse.json(
        { error: "Failed to fetch GitHub registry" },
        { status: 500 }
      );
    }

    const { content: registry, sha } = registryResponse;

    if (!registry.fastStarts) {
      registry.fastStarts = {};
    }

    registry.fastStarts[dbData.name] = {
      fastStart: dbData.faststart,
      author: dbData.author,
      type: dbData.type,
      versions: dbData.versions,
    };

    const updateResponse = await updateRegistry(registry, sha);

    if (!updateResponse) {
      return NextResponse.json(
        { error: "Failed to update GitHub registry" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Package posted to GitHub registry",
      package: dbData.name,
    });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { name, fastStart, author, type, versions }: FastStartRecord =
      await request.json();

    if (!name || !fastStart || !author || !type) {
      return NextResponse.json(
        { error: "name, fastStart, author, and type are required" },
        { status: 400 }
      );
    }

    const authError = checkAuth(request, name);
    if (authError) return authError;

    const { data: existing } = await supabase
      .from("faststarts")
      .select("id")
      .eq("name", name)
      .single();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from("faststarts")
        .update({
          faststart: fastStart,
          author,
          type,
          versions: versions || ["1.0.0"],
          updated_at: new Date().toISOString(),
        })
        .eq("name", name)
        .select()
        .single();

      result = { data, error, operation: "updated" };
    } else {
      const { data, error } = await supabase
        .from("faststarts")
        .insert({
          name,
          faststart: fastStart,
          author,
          type,
          versions: versions || ["1.0.0"],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      result = { data, error, operation: "created" };
    }

    if (result.error) {
      console.error("Database error:", result.error);
      return NextResponse.json(
        { error: "Failed to save to database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Package ${result.operation} successfully`,
      data: result.data,
    });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Package name is required" },
        { status: 400 }
      );
    }

    const authError = checkAuth(request, name);
    if (authError) return authError;

    const { error: dbError } = await supabase
      .from("faststarts")
      .delete()
      .eq("name", name);

    if (dbError) {
      console.error("Database deletion error:", dbError);
      return NextResponse.json(
        { error: "Failed to delete from database" },
        { status: 500 }
      );
    }

    const registryResponse = await getRegistry();
    if (!registryResponse) {
      return NextResponse.json(
        { error: "Failed to fetch GitHub registry" },
        { status: 500 }
      );
    }

    const { content: registry, sha } = registryResponse;

    if (registry.fastStarts && registry.fastStarts[name]) {
      delete registry.fastStarts[name];

      const updateResponse = await updateRegistry(registry, sha);

      if (!updateResponse) {
        return NextResponse.json(
          { error: "Failed to update GitHub registry" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Package deleted from both database and GitHub registry",
      package: name,
    });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
