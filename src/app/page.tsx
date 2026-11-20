import type { Metadata } from "next";
import { getAllBooks, getAllCategories } from "@/lib/content";
import BooksExplorer from "@/components/BooksExplorer";

export const metadata: Metadata = {
  title: "مكتبتي — أرشيف إلكتروني حر لأمهات الكتب التراثية والأثرية",
  description:
    "اقرأ وحمّل كتب التراث والعقيدة والفقه والتاريخ الإسلامي كاملة ومجاناً، بنصوصها الأصلية دون تحريف، مع فهارس تفاعلية لكل كتاب وفصل.",
};

export default function HomePage() {
  const books = getAllBooks();
  const categories = getAllCategories();

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-10 md:px-6">
      <h1 className="font-read text-3xl font-bold md:text-4xl" style={{ color: "var(--ink)" }}>
        مكتبتي
      </h1>
      <p className="mt-3 max-w-measure font-ui leading-7" style={{ color: "var(--ink-soft)" }}>
        أرشيف إلكتروني حر لأمهات الكتب التراثية والأثرية، نُتيحها كاملة بنصوصها الأصلية كما وردت
        في مصادرها دون تحريف أو تلخيص، إلى جانب فهارس تفاعلية توضّح هيكل كل كتاب وفصل، وإمكانية
        تحميل كل كتاب بصيغة PDF، لغايات العلم والبحث.
      </p>

      <div className="mt-8">
        <BooksExplorer books={books} categories={categories} />
      </div>
    </main>
  );
}
