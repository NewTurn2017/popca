export type CardInput = {
  brand: string;
  name: string;
  title: string;
  handle: string;
  website: string;
};

export type StoredCard = CardInput & {
  slug: string;
  editToken: string;
  styleName: string;
  accent: string;
  cellIndex: number;
  cardImageUrl: string;
  compositeUrl?: string;
  logoUrl?: string;
  views: number;
  createdAt: number;
};

export type PublicCard = Omit<StoredCard, "editToken">;

export type CreateCardPayload = CardInput & {
  slug?: string;
  editToken: string;
  styleName: string;
  accent: string;
  cellIndex: number;
  cardImageUrl: string;
  compositeUrl?: string;
  logoUrl?: string;
};
