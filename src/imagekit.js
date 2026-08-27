const API_BASE_URL = (
  import.meta.env.VITE_IMAGEKIT_API_BASE_URL ||
  "http://localhost:10000"
).replace(/\/$/, "");

export async function uploadHostellerPhoto(file) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("fileName", file.name);

  const response = await fetch(
    `${API_BASE_URL}/api/imagekit/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const contentType = response.headers.get("content-type") || "";

  let data = {};

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    throw new Error(
      text || `Upload failed with status ${response.status}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.error || "Image upload failed."
    );
  }

  return data;
}

export async function deleteHostellerPhoto(fileId) {
  const response = await fetch(
    `${API_BASE_URL}/api/imagekit/delete/${encodeURIComponent(fileId)}`,
    {
      method: "DELETE",
    }
  );

  const contentType =
    response.headers.get("content-type") || "";

  let data = {};

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    throw new Error(
      text || `Delete failed with status ${response.status}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.error || "Image deletion failed."
    );
  }

  return data;
}