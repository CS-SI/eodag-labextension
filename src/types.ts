/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

export interface IFormInput {
  geometry: IGeometry;
  startDate: Date;
  endDate: Date;
  productType: string;
  cloud: number;
  additionnalParameters?: { name: string; value: string }[];
}

export interface ISearchParameters {
  dtstart?: string; // format: YYYY-MM-DD
  dtend?: string; // format: YYYY-MM-DD
  cloudCover?: number;
  page?: number;
  geom?: IGeometry;
  [key: string]: any;
}

export interface IGeometry {
  type: string;
  coordinates: number[];
}
// export type IFeaturePropertie = [string, any];
export interface IFeaturePropertie {
  key: string;
  value: any;
}

// export type IFeaturePropertie = [string, any];
export interface IFeaturePropertie {
  key: string;
  value: any;
}
