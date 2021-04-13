export interface SearchDTO {
  productType?: string;
  startDate?: Date;
  endDate?: Date;
  cloud?: number;
}
export interface Extent {
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
}
