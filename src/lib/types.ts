export interface BookMeta {
  title: string;
  author: string;
  era?: string;
  category: string;
  cover?: string;
  pdf?: string;
  summary: string;
  intro?: string;
  structureDiagramLabel?: string;
  structureDiagram?: string;
  published?: boolean;
}

export interface Book extends BookMeta {
  slug: string;
  chaptersCount: number;
}

export interface ChapterSection {
  heading?: string;
  paragraphs: string[];
}

export interface ChapterData {
  slug: string;
  order: number;
  title: string;
  diagramLabel?: string;
  diagram?: string;
  sections: ChapterSection[];
}

export interface ChapterSummary {
  slug: string;
  order: number;
  title: string;
}
