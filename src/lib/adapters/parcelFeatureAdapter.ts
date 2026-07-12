import type { StandardParcel } from '@/src/types/apiLab';
import type { PolygonGeometry } from '@/src/types/geometry';
import type { ParcelFeature } from '@/src/types/parcel';
import { canDisplayGeometryOnMap } from '@/src/lib/crs';

const isPolygonGeometry = (geometry: StandardParcel['geometry']): geometry is PolygonGeometry =>
  geometry?.type === 'Polygon';

const normalizeArea = (value?: number) =>
  Number.isFinite(value) && value && value > 0 ? value : 0;

export const canConvertToParcelFeature = (parcel: StandardParcel) =>
  Boolean(parcel.geometry) && isPolygonGeometry(parcel.geometry) && canDisplayGeometryOnMap(parcel.crsStatus);

export const toParcelFeatureCandidate = (parcel: StandardParcel, index = 0): ParcelFeature | null => {
  if (!canConvertToParcelFeature(parcel)) return null;
  const geometry = parcel.geometry;
  if (!isPolygonGeometry(geometry)) return null;

  const areaSqm = normalizeArea(parcel.areaSqm);
  const officialLandPricePerSqm = 0;

  return {
    id: `api-${parcel.source}-${parcel.id || index}`,
    pnu: parcel.pnu ?? `api-pnu-${index + 1}`,
    lotNumber: parcel.lotNumber ?? parcel.externalId ?? `${index + 1}`,
    address: parcel.address ?? parcel.name ?? '주소 미확인 API 후보 필지',
    areaSqm,
    landShareSqm: areaSqm,
    askingPriceKRW: 0,
    officialLandPricePerSqm,
    landUseZone: '미확인',
    buildingAge: 0,
    roadAccess: '보통',
    isInsideZone: false,
    geometry,
  };
};

export const toParcelFeatureCandidates = (parcels: StandardParcel[]) =>
  parcels
    .map((parcel, index) => toParcelFeatureCandidate(parcel, index))
    .filter((parcel): parcel is ParcelFeature => Boolean(parcel));
