import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getAccessToken() {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GOOGLE_REFRESH_TOKEN");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken!,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

async function findOrCreateProfilePhotosFolder(accessToken: string, parentFolderId: string): Promise<string> {
  const folderName = "Fotos de Perfil";

  // Search for existing folder
  const searchQuery = `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name)`;

  const searchResponse = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const searchData = await searchResponse.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder if not exists
  const createResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    }),
  });

  const createData = await createResponse.json();
  if (!createResponse.ok) {
    throw new Error(`Failed to create folder: ${JSON.stringify(createData)}`);
  }

  return createData.id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify token and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email, avatar_drive_file_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw new Error(`Failed to get profile: ${profileError.message}`);
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: "Invalid file type. Use JPG, PNG or WEBP" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "File too large. Max 5MB" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = await getAccessToken();
    const rootFolderId = Deno.env.get("GOOGLE_DRIVE_FOLDER_ID")!;

    // Find or create "Fotos de Perfil" folder
    const profilePhotosFolderId = await findOrCreateProfilePhotosFolder(accessToken, rootFolderId);

    // Delete existing photo if exists
    if (profile.avatar_drive_file_id) {
      try {
        await fetch(`https://www.googleapis.com/drive/v3/files/${profile.avatar_drive_file_id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log("Deleted old profile photo:", profile.avatar_drive_file_id);
      } catch (e) {
        console.error("Error deleting old photo:", e);
      }
    }

    // Generate filename
    const extension = file.name.split(".").pop() || "jpg";
    const fullName = profile.full_name || "Usuario";
    const email = profile.email || user.email || "sem-email";
    const fileName = `Foto de perfil - ${fullName} - ${email}.${extension}`;

    // Upload to Google Drive
    const fileContent = await file.arrayBuffer();
    const boundary = "-------314159265358979323846";
    const metadata = {
      name: fileName,
      parents: [profilePhotosFolderId],
    };

    const multipartBody =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: ${file.type}\r\n\r\n`;

    const endBoundary = `\r\n--${boundary}--`;

    const bodyParts = new Uint8Array([
      ...new TextEncoder().encode(multipartBody),
      ...new Uint8Array(fileContent),
      ...new TextEncoder().encode(endBoundary),
    ]);

    const uploadResponse = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: bodyParts,
      }
    );

    const uploadData = await uploadResponse.json();
    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload: ${JSON.stringify(uploadData)}`);
    }

    // Make file public
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${uploadData.id}/permissions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "reader",
          type: "anyone",
        }),
      });
    } catch (e) {
      console.error("Error making file public:", e);
    }

    // Generate thumbnail URL
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${uploadData.id}&sz=w400`;

    // Update profile with new avatar
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: thumbnailUrl,
        avatar_drive_file_id: uploadData.id,
      })
      .eq("id", user.id);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    console.log("Profile photo uploaded:", uploadData.id);

    return new Response(
      JSON.stringify({
        success: true,
        driveFileId: uploadData.id,
        imageUrl: thumbnailUrl,
        viewLink: uploadData.webViewLink,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
