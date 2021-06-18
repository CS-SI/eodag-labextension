/**
 * Copyright 2021 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

export interface IFormInput {
  geometry: Geometry;
  startDate: Date;
  endDate: Date;
  productType: string;
  cloud: number;
  additionnalParameters?: { name: string; value: string }[];
}

export interface SearchParameters {
  dtstart?: string; // format: YYYY-MM-DD
  dtend?: string; // format: YYYY-MM-DD
  cloudCover?: number;
  page?: number;
  geom?: Geometry;
  [key: string]: any;
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
