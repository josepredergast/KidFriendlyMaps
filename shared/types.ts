export interface Place {
  id: string | number;
  type: PlaceType;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  website?: string;
  phone?: string;
  description?: string;
  tags?: Record<string, string>;
}

export type PlaceType = 'playground' | 'park' | 'museum' | 'gallery' | 'science' | 'planetarium';

export interface ActivityConfig {
  label: string;
  description: string;
  color: string;
  icon: string;
  query: string;
}

export interface FilterState {
  [key: string]: boolean;
}

export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}
