export interface IFormInput {
  geometry: Geometry;
  startDate: Date;
  endDate: Date;
  productType: string;
  cloud: number;
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
// export type FeaturePropertie = [string, any];
export interface FeaturePropertie {
  key: string;
  value: any;
}

// export type FeaturePropertie = [string, any];
export interface FeaturePropertie {
  key: string;
  value: any;
}
