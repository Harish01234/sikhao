"use server";

import { revalidatePath } from "next/cache";
import { Open } from "unzipper";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth-redirect";
import { scormFileKey, scormFolder, scormZipKey, videoKey } from "@/lib/lesson-files";
import { readScormManifest } from "@/lib/scorm-manifest";
import {
  createUploadUrl,
  deleteKeys,
  deleteObject,
  listKeys,
  objectExists,
  readObject,
  writeObject,
} from "@/lib/storage";
import { prisma } from "@/src/lib/prisma";
import { lessonSchema } from "@/zodschemas/lesson-schema";

async function ownedModule(courseId: string, moduleId: string) {
  const session = await getAuthSession();

  if (session?.user.role !== "instructor") {
    return { error: "Only an instructor can change a lesson." };
  }

  const course = await prisma.course.findFirst({
    where: { id: courseId, instructorId: session.user.id },
  });

  if (!course) {
    return { error: "That course was not found." };
  }

  const module = await prisma.module.findFirst({
    where: { id: moduleId, courseId: course.id },
  });

  if (!module) {
    return { error: "That module was not found." };
  }

  return { course, module };
}

async function ownedLesson(courseId: string, moduleId: string, lessonId: string) {
  const owned = await ownedModule(courseId, moduleId);

  if ("error" in owned) {
    return { ok: false as const, error: owned.error };
  }

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, moduleId: owned.module.id },
    include: { video: true, scorm: true },
  });

  if (!lesson) {
    return { ok: false as const, error: "That lesson was not found." };
  }

  return { ok: true as const, course: owned.course, module: owned.module, lesson };
}

async function nextLessonPosition(moduleId: string) {
  const latest = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  return (latest?.position ?? 0) + 1;
}

function lessonsPath(courseId: string, moduleId: string) {
  return `/instructor/courses/${courseId}/modules/${moduleId}/lessons`;
}

export async function createLesson(courseId: string, moduleId: string, values: unknown) {
  const owned = await ownedModule(courseId, moduleId);

  if ("error" in owned) {
    return { error: owned.error };
  }

  const parsed = lessonSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const lesson = await prisma.lesson.create({
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
      moduleId: owned.module.id,
      position: await nextLessonPosition(owned.module.id),
    },
  });

  revalidatePath(lessonsPath(owned.course.id, owned.module.id));
  return { lessonId: lesson.id };
}

export async function updateLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  values: unknown,
) {
  const owned = await ownedLesson(courseId, moduleId, lessonId);

  if (!owned.ok) {
    return { error: owned.error };
  }

  const parsed = lessonSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  await prisma.lesson.update({
    where: { id: owned.lesson.id },
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
    },
  });

  revalidatePath(lessonsPath(owned.course.id, owned.module.id));
  return { ok: true };
}

export async function prepareVideoUpload(courseId: string, moduleId: string, lessonId: string) {
  const owned = await ownedLesson(courseId, moduleId, lessonId);

  if (!owned.ok) {
    return { error: owned.error };
  }

  if (owned.lesson.type !== "video") {
    return { error: "That lesson is not a video." };
  }

  return createUploadUrl(videoKey(owned.lesson.id), "video/mp4");
}

export async function saveVideoLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  length: unknown,
) {
  const owned = await ownedLesson(courseId, moduleId, lessonId);

  if (!owned.ok) {
    return { error: owned.error };
  }

  if (owned.lesson.type !== "video") {
    return { error: "That lesson is not a video." };
  }

  const parsed = z.number().int().min(0).safeParse(length);

  if (!parsed.success) {
    return { error: "That video has no length." };
  }

  const key = videoKey(owned.lesson.id);

  if (!(await objectExists(key))) {
    return { error: "Upload the video first." };
  }

  await prisma.videoLesson.upsert({
    where: { lessonId: owned.lesson.id },
    create: {
      lessonId: owned.lesson.id,
      videoUrl: key,
      length: parsed.data,
    },
    update: {
      videoUrl: key,
      length: parsed.data,
    },
  });

  if (owned.lesson.scorm) {
    await prisma.scormLesson.delete({ where: { lessonId: owned.lesson.id } });
    await deleteKeys(await listKeys(scormFolder(owned.lesson.id)));
  }

  revalidatePath(lessonsPath(owned.course.id, owned.module.id));
  return { ok: true };
}

export async function prepareScormUpload(courseId: string, moduleId: string, lessonId: string) {
  const owned = await ownedLesson(courseId, moduleId, lessonId);

  if (!owned.ok) {
    return { error: owned.error };
  }

  if (owned.lesson.type !== "scorm") {
    return { error: "That lesson is not SCORM." };
  }

  return createUploadUrl(scormZipKey(owned.lesson.id), "application/zip");
}

export async function saveScormLesson(courseId: string, moduleId: string, lessonId: string) {
  const owned = await ownedLesson(courseId, moduleId, lessonId);

  if (!owned.ok) {
    return { error: owned.error };
  }

  if (owned.lesson.type !== "scorm") {
    return { error: "That lesson is not SCORM." };
  }

  try {
    const stored = await storeScormPackage(owned.lesson.id);

    await prisma.scormLesson.upsert({
      where: { lessonId: owned.lesson.id },
      create: {
        lessonId: owned.lesson.id,
        packageUrl: stored.packageUrl,
        entryPoint: stored.entryPoint,
        scormVersion: stored.scormVersion,
      },
      update: {
        packageUrl: stored.packageUrl,
        entryPoint: stored.entryPoint,
        scormVersion: stored.scormVersion,
      },
    });

    if (owned.lesson.video) {
      await prisma.videoLesson.delete({ where: { lessonId: owned.lesson.id } });
      await deleteObject(videoKey(owned.lesson.id));
    }
  } catch (error) {
    return { error: scormError(error) };
  }

  revalidatePath(lessonsPath(owned.course.id, owned.module.id));
  return { ok: true };
}

export async function deleteLesson(courseId: string, moduleId: string, lessonId: string) {
  const owned = await ownedLesson(courseId, moduleId, lessonId);

  if (!owned.ok) {
    return { error: owned.error };
  }

  try {
    await deleteObject(videoKey(owned.lesson.id));
    await deleteKeys(await listKeys(scormFolder(owned.lesson.id)));
  } catch {
    return { error: "The lesson file could not be removed." };
  }

  await prisma.lesson.delete({
    where: { id: owned.lesson.id },
  });

  revalidatePath(lessonsPath(owned.course.id, owned.module.id));
  return { ok: true };
}

async function storeScormPackage(lessonId: string) {
  const zipKey = scormZipKey(lessonId);
  const folder = scormFolder(lessonId);
  let zip: Buffer;

  try {
    zip = await readObject(zipKey);
  } catch (error) {
    if (error instanceof Error && error.message === "That file was not found.") {
      throw new Error("Upload the SCORM package first.");
    }

    throw error;
  }

  let directory;

  try {
    directory = await Open.buffer(zip);
  } catch {
    throw new Error("The SCORM package could not be opened.");
  }

  const files = directory.files.filter((file) => file.type === "File" && isPackageFile(file.path));
  const manifestFile = files
    .filter((file) => fileName(file.path) === "imsmanifest.xml")
    .sort((a, b) => a.path.length - b.path.length)[0];

  if (!manifestFile) {
    throw new Error("The SCORM package has no manifest.");
  }

  const manifest = readScormManifest((await manifestFile.buffer()).toString("utf8"));
  const entryPoint = joinPath(directoryOf(manifestFile.path), manifest.entryPoint);
  const entries = files.map((file) => ({
    file,
    path: normalizePath(file.path),
    key: scormFileKey(lessonId, normalizePath(file.path)),
  }));

  if (!entries.some((entry) => entry.path === entryPoint)) {
    throw new Error("The SCORM package has no start file.");
  }

  const uploaded = new Set<string>([zipKey]);

  for (const entry of entries) {
    await writeObject(entry.key, await entry.file.buffer(), contentTypeFor(entry.path));
    uploaded.add(entry.key);
  }

  const existing = await listKeys(folder);
  await deleteKeys(existing.filter((key) => !uploaded.has(key)));

  return {
    packageUrl: folder,
    entryPoint,
    scormVersion: manifest.scormVersion,
  };
}

function scormError(error: unknown) {
  if (error instanceof Error && /^(The SCORM|Upload the SCORM|That file path)/.test(error.message)) {
    return error.message;
  }

  return "The SCORM package could not be saved.";
}

function isPackageFile(path: string) {
  const parts = normalizePath(path).split("/");
  return parts.every((part) => part && part !== "__MACOSX" && !part.startsWith("."));
}

function normalizePath(path: string) {
  return path.replaceAll("\\", "/").replace(/^\/+/, "");
}

function fileName(path: string) {
  return normalizePath(path).split("/").pop()?.toLowerCase();
}

function directoryOf(path: string) {
  const clean = normalizePath(path);
  const slash = clean.lastIndexOf("/");
  return slash === -1 ? "" : clean.slice(0, slash);
}

function joinPath(directory: string, file: string) {
  return directory ? `${directory}/${file}` : file;
}

function contentTypeFor(path: string) {
  const extension = path.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    html: "text/html",
    htm: "text/html",
    js: "text/javascript",
    css: "text/css",
    json: "application/json",
    xml: "application/xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    pdf: "application/pdf",
    woff: "font/woff",
    woff2: "font/woff2",
  };

  return types[extension ?? ""] ?? "application/octet-stream";
}
