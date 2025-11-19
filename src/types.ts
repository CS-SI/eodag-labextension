/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

export interface IFormInput {
  collection?: string | null;
  provider?: string | null;
  geometry?: IGeometry;
  startDate?: Date;
  endDate?: Date;
  id?: string;
  additionalParameters?: { name: string; value: string }[];

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
  divider?: boolean;
}

// TODO: Need to type this
export interface IFeatures {
  type: any;
  features: any[];
}

export interface IProduct {
  id: string;
  start_datetime?: string;
  end_datetime?: string;
  'eodag:thumbnail'?: string;
  'eodag:quicklook'?: string;
  cloud_cover?: number;
  properties: { [key: string]: any };
}

export interface ICustomError {
  name: string;
  title: string;
  details: string;
}
