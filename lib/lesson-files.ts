function lessonId(id: string) {
  const clean = id.trim();

  if (!clean || clean.includes("/") || clean.includes("\\") || clean.includes("..")) {
    throw new Error("That lesson id is not allowed.");
  }

  return clean;
}

function relativePath(path: string) {
  const clean = path.replaceAll("\\", "/").replace(/^\/+/, "");
  const parts = clean.split("/");

  if (!clean || parts.some((part) => part === "" || part === "." || part === "..")) {
    throw new Error("That file path is not allowed.");
  }

  return clean;
}

export function videoKey(id: string) {
  return `videos/${lessonId(id)}/video.mp4`;
}

export function scormZipKey(id: string) {
  return `scorm/${lessonId(id)}/package.zip`;
}

export function scormFolder(id: string) {
  return `scorm/${lessonId(id)}/`;
}

export function scormFileKey(id: string, path: string) {
  return `${scormFolder(id)}${relativePath(path)}`;
}
