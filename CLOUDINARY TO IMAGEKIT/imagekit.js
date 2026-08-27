const API_BASE_URL = (
  import.meta.env.VITE_IMAGEKIT_API_BASE_URL || ""
).replace(/\/$/, "");

export async function uploadHostellerPhoto(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);

  const response = await fetch(`${API_BASE_URL}/api/imagekit/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Image upload failed.");
  }

  return data;
}

export async function deleteHostellerPhoto(fileId) {
  const response = await fetch(
    `${API_BASE_URL}/api/imagekit/delete/${encodeURIComponent(fileId)}`,
    { method: "DELETE" }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Image deletion failed.");
  }

  return data;
}
