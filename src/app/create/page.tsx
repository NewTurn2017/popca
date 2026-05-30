import { CreateWizard } from "@/components/CreateWizard";

export const metadata = { title: "팝카 만들기" };

export default function CreatePage() {
  return <main className="min-h-screen"><CreateWizard /></main>;
}
