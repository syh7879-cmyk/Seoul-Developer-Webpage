import type { MultiPolygonGeometry, PolygonGeometry } from '@/src/types/geometry';

export type ApiLabResponse<T> = {
  ok: boolean;
  source: string;
  raw?: unknown;
  data?: T;
  error?: string;
};

export type StandardParcel = {
  id: string;
  pnu?: string;
  lotNumber?: string;
  address?: string;
  areaSqm?: number;
  geometry?: PolygonGeometry | MultiPolygonGeometry;
  source: 'vworld' | 'mock';
  raw?: unknown;
};

export type StandardRedevelopmentZone = {
  id: string;
  name: string;
  projectType?: string;
  district?: string;
  address?: string;
  currentStage?: string;
  zoneAreaSqm?: number;
  geometry?: PolygonGeometry | MultiPolygonGeometry;
  source: 'seoul-open-data' | 'manual' | 'mock';
  raw?: unknown;
};

export type StandardLandUse = {
  pnu?: string;
  landUseZone?: string;
  districtUnitPlan?: string;
  raw?: unknown;
};

export type StandardBuildingRegister = {
  pnu?: string;
  address?: string;
  approvalDate?: string;
  mainUse?: string;
  floorCount?: number;
  grossFloorAreaSqm?: number;
  raw?: unknown;
};

export type StandardLandPrice = {
  pnu?: string;
  baseYear?: string;
  officialLandPricePerSqm?: number;
  areaSqm?: number;
  raw?: unknown;
};
