export interface FormDTO {
  productType?: string;
  startDate?: Date;
  endDate?: Date;
  cloud?: number;
}

export interface SearchParameters {
  dtstart?: string; // format: YYYY-MM-DD
  dtend?: string; // format: YYYY-MM-DD
  cloudCover?: number;
  page?: number;
  geom?: Geometry;
}

export interface Geometry {
  type: string;
  coordinates: number[];
}
export interface Extent {
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
}

// export type FeaturePropertie = [string, any];
export interface FeaturePropertie {
  key: string;
  value: any;
}
