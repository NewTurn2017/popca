import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConceptBoard } from "@/components/ConceptBoard";
import { cardsToItems, GalleryBoard, tessellatedLayout } from "@/components/GalleryBoard";
import type { PublicCard } from "@/types/card";

type MockWaseeProps = {
  items: Array<{ id: string | number; title?: string }>;
  renderDetail?: (context: { item: { id: string | number; title?: string }; close: () => void; next: () => void; previous: () => void; index: number }) => React.ReactNode;
};

vi.mock("wasee-gallery/react", () => ({
  WaseeGallery: ({ items, renderDetail }: MockWaseeProps) => <div data-testid="wasee-mock">{items.map((item) => <span key={item.id}>{item.title}</span>)}{renderDetail?.({ item: items[0], close: vi.fn(), next: vi.fn(), previous: vi.fn(), index: 0 })}</div>,
}));
vi.mock("wasee-gallery/styles.css", () => ({}));

const card: PublicCard = {
  slug: "Abc123ZZ",
  brand: "POPCA",
  name: "Genie",
  title: "Maker",
  handle: "@genie",
  website: "pop.ca",
  styleName: "Arctic Glass",
  accent: "#5ac8ff",
  cellIndex: 0,
  cardImageUrl: "data:image/png;base64,AA==",
  views: 3,
  createdAt: 1,
};

describe("ConceptBoard", () => {
  it("renders six numbered selectors and supports click/keyboard selection", () => {
    const onSelect = vi.fn();
    render(<ConceptBoard imageSrc="data:image/png;base64,AA==" selectedIndex={null} onSelect={onSelect} />);
    expect(screen.getAllByRole("button")).toHaveLength(6);
    fireEvent.click(screen.getByRole("button", { name: /2번/ }));
    fireEvent.keyDown(window, { key: "6" });
    expect(onSelect).toHaveBeenNthCalledWith(1, 1);
    expect(onSelect).toHaveBeenNthCalledWith(2, 5);
  });
});

describe("GalleryBoard", () => {
  it("maps cards to Wasee items and uses tessellated layout metadata", () => {
    const items = cardsToItems([card]);
    expect(items[0]).toMatchObject({ id: "Abc123ZZ", title: "Genie", description: "@genie · POPCA" });
    expect(tessellatedLayout(items)[0].cluster).toBe("tessellated");
  });
  it("renders empty and populated states", () => {
    const { rerender } = render(<GalleryBoard cards={[]} />);
    expect(screen.getByText(/아직 갤러리에/)).toBeInTheDocument();
    rerender(<GalleryBoard cards={[card]} />);
    expect(screen.getByTestId("wasee-mock")).toHaveTextContent("Genie");
    expect(screen.getByText("이 명함 열기")).toHaveAttribute("href", "/c/Abc123ZZ");
  });
});
