import express from "express";
import cors from "cors";
import multer from "multer";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
}));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function imageKitAuthHeader() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) throw new Error("IMAGEKIT_PRIVATE_KEY is not configured.");
  return `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;
}

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/api/imagekit/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image file was provided." });
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Only JPG, PNG, and WEBP images are allowed." });
    }

    const formData = new FormData();
    formData.append("file", new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
    formData.append("fileName", req.body.fileName || req.file.originalname);
    formData.append("useUniqueFileName", "true");
    formData.append("folder", "/lt-sailo-hosteller-photos");

    const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: { Authorization: imageKitAuthHeader() },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("ImageKit upload failed:", data);
      return res.status(response.status).json({ error: data.message || data.error || "ImageKit upload failed." });
    }
    return res.status(201).json({ fileId: data.fileId, url: data.url, name: data.name, filePath: data.filePath });
  } catch (error) {
    console.error("Upload server error:", error);
    return res.status(500).json({ error: "Unable to upload image." });
  }
});

app.delete("/api/imagekit/delete/:fileId", async (req, res) => {
  try {
    const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(req.params.fileId)}`, {
      method: "DELETE",
      headers: { Accept: "application/json", Authorization: imageKitAuthHeader() },
    });
    if (!response.ok) {
      const text = await response.text();
      console.error("ImageKit delete failed:", text);
      return res.status(response.status).json({ error: "ImageKit could not delete the image." });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error("Delete server error:", error);
    return res.status(500).json({ error: "Unable to delete image." });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) return res.status(400).json({ error: "Image must be 10MB or smaller." });
  return res.status(500).json({ error: error.message || "Server error." });
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`LT Sailo ImageKit API running on port ${port}`));
