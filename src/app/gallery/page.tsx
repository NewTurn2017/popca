import { GalleryBoard } from "@/components/GalleryBoard";
import { ButtonLink } from "@/components/ui/Button";
import { listPublicCards } from "@/lib/serverCards";

export const dynamic = "force-dynamic";
export const metadata = { title: "팝카 갤러리" };

export default async function GalleryPage() {
  const cards = await listPublicCards(80);
  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-bold text-cyan-200">wasee-gallery / tessellated</p><h1 className="mt-2 text-4xl font-black">팝카 갤러리</h1><p className="mt-2 text-slate-400">만들어진 디지털 명함들이 입체 보드처럼 펼쳐집니다.</p></div>
          <ButtonLink href="/create">새 팝카 만들기</ButtonLink>
        </div>
        <GalleryBoard cards={cards} />
      </div>
    </main>
  );
}
