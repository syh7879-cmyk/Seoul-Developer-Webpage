export interface ParcelFeature {
  id: string;
  pnu: string;
  lotNumber: string;
  address: string;
  areaSqm: number;
  officialLandPricePerSqm: number;
  landUseZone: string;
  buildingAge: number;
  roadAccess: '양호' | '보통' | '약함' | '미접';
  isInsideZone: boolean;
  geometry: GeoJSON.Polygon;
}
