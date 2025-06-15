export type Database = CategoryList & CategoryGameData & CategoryMangaData;

export type CategoryGame = NintendoId | SonyId | MicrosoftId;
export type CategoryManga = MangaId;
export type CategoryId = CategoryGame | CategoryManga;

export type MangaId = "manga" | "anime";
export type SonyId = "ps1" | "ps2";
export type MicrosoftId = "xbox";
export type NintendoId =
  | "gb"
  | "gbc"
  | "gba"
  | "gc"
  | "n64"
  | "ds"
  | "snes"
  | "wii";

export type CategoryGameData = Record<CategoryGame, Game[]>;
export type CategoryMangaData = Record<CategoryManga, Manga[]>;
export type CategoryList = { categories: Category[] };

export interface Category {
  id: CategoryGame | CategoryManga;
  name: string;
  image: string;
}

export interface Manga {
  id: string;
  name: string;
  total: number;
  owned: number[];
  rating?: number;
}

export interface Game {
  id: string;
  name: string;
  status: "owned" | "not-owned";
  price?: number;
  rating?: number;
}
