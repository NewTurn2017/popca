import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center px-5 text-center"><div><p className="text-sm font-bold text-cyan-200">404</p><h1 className="mt-3 text-4xl font-black">팝카를 찾을 수 없어요.</h1><p className="mt-3 text-slate-400">삭제되었거나 잘못된 짧은 링크입니다.</p><ButtonLink className="mt-6" href="/create">새 팝카 만들기</ButtonLink></div></main>;
}
