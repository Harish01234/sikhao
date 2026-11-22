-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('video', 'scorm');

-- CreateEnum
CREATE TYPE "ScormVersion" AS ENUM ('1.2', '2004');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('active', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "instructorId" TEXT NOT NULL,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "type" "LessonType" NOT NULL,

    CONSTRAINT "lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_lesson" (
    "lessonId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "length" INTEGER NOT NULL,

    CONSTRAINT "video_lesson_pkey" PRIMARY KEY ("lessonId")
);

-- CreateTable
CREATE TABLE "scorm_lesson" (
    "lessonId" TEXT NOT NULL,
    "packageUrl" TEXT NOT NULL,
    "entryPoint" TEXT NOT NULL,
    "scormVersion" "ScormVersion" NOT NULL,

    CONSTRAINT "scorm_lesson_pkey" PRIMARY KEY ("lessonId")
);

-- CreateTable
CREATE TABLE "course_enrollment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" "EnrollmentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "watchedSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scorm_progress" (
    "lessonProgressId" TEXT NOT NULL,
    "completionStatus" TEXT NOT NULL,
    "score" DECIMAL(5,2),
    "location" TEXT,
    "suspendData" TEXT NOT NULL,

    CONSTRAINT "scorm_progress_pkey" PRIMARY KEY ("lessonProgressId")
);

-- CreateIndex
CREATE INDEX "course_instructorId_idx" ON "course"("instructorId");

-- CreateIndex
CREATE INDEX "module_courseId_idx" ON "module"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "module_courseId_position_key" ON "module"("courseId", "position");

-- CreateIndex
CREATE INDEX "lesson_moduleId_idx" ON "lesson"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_moduleId_position_key" ON "lesson"("moduleId", "position");

-- CreateIndex
CREATE INDEX "course_enrollment_courseId_idx" ON "course_enrollment"("courseId");

-- CreateIndex
CREATE INDEX "course_enrollment_learnerId_idx" ON "course_enrollment"("learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollment_learnerId_courseId_key" ON "course_enrollment"("learnerId", "courseId");

-- CreateIndex
CREATE INDEX "lesson_progress_lessonId_idx" ON "lesson_progress"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_userId_lessonId_key" ON "lesson_progress"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module" ADD CONSTRAINT "module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_lesson" ADD CONSTRAINT "video_lesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scorm_lesson" ADD CONSTRAINT "scorm_lesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollment" ADD CONSTRAINT "course_enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollment" ADD CONSTRAINT "course_enrollment_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scorm_progress" ADD CONSTRAINT "scorm_progress_lessonProgressId_fkey" FOREIGN KEY ("lessonProgressId") REFERENCES "lesson_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
