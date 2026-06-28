import type { PolygonGeometry } from '@/src/types/geometry';

export interface ZoneFeature {
  id: string;
  name: string;
  projectType: '재개발' | '재건축' | '가로주택정비' | '소규모재건축' | '리모델링';
  district: string;
  address: string;
  currentStage: string;
  zoneAreaSqm: number;
  expectedHouseholds: number;
  unionMembers: number;
  estimatedGeneralSale: string;
  riskSummary: string[];
  nearbyZones: string[];
  geometry: PolygonGeometry;
}
