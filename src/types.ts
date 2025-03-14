/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

export interface IFormInput {
  geometry: IGeometry;
  startDate: Date;
  endDate: Date;
  productType: string;
  provider: string;
  additionnalParameters?: { name: string; value: string }[];
  [key: string]: any;
}

export interface ISearchParameters {
  dtstart?: string; // format: YYYY-MM-DD
  dtend?: string; // format: YYYY-MM-DD
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

export type MapSettings = { lat: number; lon: number; zoom: number };

export interface IQueryables {
  properties: { [key: string]: { [key: string]: unknown } };
  required?: string[];
  additionalProperties: boolean;
}

export interface IParameter {
  key: string;
  value: { [key: string]: any };
  mandatory: boolean;
}

export interface IOptionType {
  value: string;
  label: string;
}
