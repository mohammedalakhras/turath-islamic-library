import fs from "node:fs";
import path from "node:path";
import type { Book, BookMeta, ChapterData, ChapterSummary } from "./types";

// هام جداً: هذا الملف يستورد fs/path، لذا يُستخدم فقط داخل مكوّنات الخادم
// (Server Components) وملفات generateStaticParams/generateMetadata، أي أثناء
// البناء (next build) حصراً. أي مكوّن "use client" يحتاج withBase/absoluteUrl
// يجب أن يستوردهما من "@/lib/site" مباشرة، وليس من هنا — وإلا فشل بناء حزمة
// المتصفح لأن fs/path غير موجودين هناك (هذا بالضبط ما كشفه اختبار البناء محلياً).
//
// الوصف التالي ينطبق على بقية الملف:
// generateStaticParams/generateMetadata، أي أثناء البناء (next build) حصراً.
// لا تستورده من أي "use client" مكوّن.

const BOOKS_DIR = path.join(process.cwd(), "content", "books");

function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

/** كل مجلدات الكتب الموجودة فعلياً تحت content/books (اسم المجلد = الـ slug) */
export function getAllBookSlugs(): string[] {
  if (!fs.existsSync(BOOKS_DIR)) return [];
  return fs
    .readdirSync(BOOKS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((slug) => fs.existsSync(path.join(BOOKS_DIR, slug, "meta.json")));
}

export function getBookMeta(slug: string): BookMeta {
  return readJson<BookMeta>(path.join(BOOKS_DIR, slug, "meta.json"));
}

/** قائمة ملخصة بفصول كتاب معيّن، مرتّبة حسب حقل order */
export function getChapterSummaries(bookSlug: string): ChapterSummary[] {
  const dir = path.join(BOOKS_DIR, bookSlug, "chapters");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const chapters = files.map((f) => {
    const data = readJson<ChapterData>(path.join(dir, f));
    return { slug: data.slug, order: data.order, title: data.title };
  });
  return chapters.sort((a, b) => a.order - b.order);
}

export function getChapterData(bookSlug: string, chapterSlug: string): ChapterData | null {
  const dir = path.join(BOOKS_DIR, bookSlug, "chapters");
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  for (const f of files) {
    const data = readJson<ChapterData>(path.join(dir, f));
    if (data.slug === chapterSlug) return data;
  }
  return null;
}

export function getBook(slug: string): Book {
  const meta = getBookMeta(slug);
  const chaptersCount = getChapterSummaries(slug).length;
  return { slug, chaptersCount, ...meta };
}

/** كل الكتب المنشورة (published !== false)، لعرضها في الصفحة الرئيسية */
export function getAllBooks(): Book[] {
  return getAllBookSlugs()
    .map((slug) => getBook(slug))
    .filter((b) => b.published !== false)
    .sort((a, b) => a.title.localeCompare(b.title, "ar"));
}

export function getAllCategories(): string[] {
  const set = new Set(getAllBooks().map((b) => b.category));
  return Array.from(set);
}

// absoluteUrl / withBase / SITE_URL / BASE_PATH انتقلت إلى "@/lib/site"
// (أعيد تصديرها هنا فقط من أجل راحة الاستيراد داخل ملفات الخادم/الصفحات،
// لا تستوردها من هنا داخل أي مكوّن "use client")
export { absoluteUrl, withBase, SITE_URL, BASE_PATH } from "./site";
