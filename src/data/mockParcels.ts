import type { ParcelFeature } from '@/src/types/parcel';

const parcelGeometry = (lng: number, lat: number) => ({
  type: 'Polygon' as const,
  coordinates: [[
    [lng, lat],
    [lng + 0.00018, lat],
    [lng + 0.00018, lat + 0.00014],
    [lng, lat + 0.00014],
    [lng, lat],
  ]],
});

export const mockParcels: ParcelFeature[] = [
  { id: 'parcel-1', pnu: '110101-1', lotNumber: '1', address: '장위동 1', areaSqm: 320, officialLandPricePerSqm: 2200000, landUseZone: '주거', buildingAge: 16, roadAccess: '양호', isInsideZone: true, geometry: parcelGeometry(127.0533, 37.6125) },
  { id: 'parcel-2', pnu: '110101-2', lotNumber: '2', address: '장위동 2', areaSqm: 290, officialLandPricePerSqm: 2140000, landUseZone: '주거', buildingAge: 24, roadAccess: '양호', isInsideZone: true, geometry: parcelGeometry(127.0546, 37.6125) },
  { id: 'parcel-3', pnu: '110101-3', lotNumber: '3', address: '장위동 3', areaSqm: 340, officialLandPricePerSqm: 2320000, landUseZone: '주거', buildingAge: 29, roadAccess: '보통', isInsideZone: true, geometry: parcelGeometry(127.0559, 37.6125) },
  { id: 'parcel-4', pnu: '110101-4', lotNumber: '4', address: '장위동 4', areaSqm: 310, officialLandPricePerSqm: 2260000, landUseZone: '상업', buildingAge: 33, roadAccess: '약함', isInsideZone: true, geometry: parcelGeometry(127.0572, 37.6125) },
  { id: 'parcel-5', pnu: '110101-5', lotNumber: '5', address: '장위동 5', areaSqm: 280, officialLandPricePerSqm: 2080000, landUseZone: '주거', buildingAge: 12, roadAccess: '양호', isInsideZone: true, geometry: parcelGeometry(127.0533, 37.6139) },
  { id: 'parcel-6', pnu: '110101-6', lotNumber: '6', address: '장위동 6', areaSqm: 350, officialLandPricePerSqm: 2380000, landUseZone: '주거', buildingAge: 18, roadAccess: '양호', isInsideZone: true, geometry: parcelGeometry(127.0546, 37.6139) },
  { id: 'parcel-7', pnu: '110101-7', lotNumber: '7', address: '장위동 7', areaSqm: 365, officialLandPricePerSqm: 2420000, landUseZone: '주거', buildingAge: 31, roadAccess: '보통', isInsideZone: true, geometry: parcelGeometry(127.0559, 37.6139) },
  { id: 'parcel-8', pnu: '110101-8', lotNumber: '8', address: '장위동 8', areaSqm: 300, officialLandPricePerSqm: 2190000, landUseZone: '주거', buildingAge: 20, roadAccess: '양호', isInsideZone: true, geometry: parcelGeometry(127.0572, 37.6139) },
  { id: 'parcel-9', pnu: '110101-9', lotNumber: '9', address: '정릉동 9', areaSqm: 410, officialLandPricePerSqm: 2500000, landUseZone: '주거', buildingAge: 27, roadAccess: '양호', isInsideZone: true, geometry: parcelGeometry(127.0125, 37.6040) },
  { id: 'parcel-10', pnu: '110101-10', lotNumber: '10', address: '정릉동 10', areaSqm: 390, officialLandPricePerSqm: 2440000, landUseZone: '주거', buildingAge: 35, roadAccess: '보통', isInsideZone: true, geometry: parcelGeometry(127.0138, 37.6040) },
  { id: 'parcel-11', pnu: '110101-11', lotNumber: '11', address: '정릉동 11', areaSqm: 330, officialLandPricePerSqm: 2280000, landUseZone: '상업', buildingAge: 22, roadAccess: '양호', isInsideZone: true, geometry: parcelGeometry(127.0151, 37.6040) },
  { id: 'parcel-12', pnu: '110101-12', lotNumber: '12', address: '정릉동 12', areaSqm: 360, officialLandPricePerSqm: 2360000, landUseZone: '주거', buildingAge: 26, roadAccess: '약함', isInsideZone: true, geometry: parcelGeometry(127.0164, 37.6040) },
  { id: 'parcel-13', pnu: '110101-13', lotNumber: '13', address: '석관동 13', areaSqm: 270, officialLandPricePerSqm: 2050000, landUseZone: '주거', buildingAge: 14, roadAccess: '양호', isInsideZone: false, geometry: parcelGeometry(127.0590, 37.6010) },
  { id: 'parcel-14', pnu: '110101-14', lotNumber: '14', address: '석관동 14', areaSqm: 295, officialLandPricePerSqm: 2120000, landUseZone: '주거', buildingAge: 21, roadAccess: '보통', isInsideZone: false, geometry: parcelGeometry(127.0603, 37.6010) },
  { id: 'parcel-15', pnu: '110101-15', lotNumber: '15', address: '석관동 15', areaSqm: 315, officialLandPricePerSqm: 2230000, landUseZone: '주거', buildingAge: 17, roadAccess: '양호', isInsideZone: false, geometry: parcelGeometry(127.0616, 37.6010) },
  { id: 'parcel-16', pnu: '110101-16', lotNumber: '16', address: '석관동 16', areaSqm: 325, officialLandPricePerSqm: 2290000, landUseZone: '상업', buildingAge: 30, roadAccess: '약함', isInsideZone: false, geometry: parcelGeometry(127.0629, 37.6010) },
  { id: 'parcel-17', pnu: '110101-17', lotNumber: '17', address: '장위동 17', areaSqm: 380, officialLandPricePerSqm: 2460000, landUseZone: '주거', buildingAge: 15, roadAccess: '양호', isInsideZone: true, geometry: parcelGeometry(127.0533, 37.6153) },
  { id: 'parcel-18', pnu: '110101-18', lotNumber: '18', address: '장위동 18', areaSqm: 360, officialLandPricePerSqm: 2400000, landUseZone: '주거', buildingAge: 19, roadAccess: '보통', isInsideZone: true, geometry: parcelGeometry(127.0546, 37.6153) },
  { id: 'parcel-19', pnu: '110101-19', lotNumber: '19', address: '장위동 19', areaSqm: 420, officialLandPricePerSqm: 2550000, landUseZone: '상업', buildingAge: 34, roadAccess: '약함', isInsideZone: true, geometry: parcelGeometry(127.0559, 37.6153) },
  { id: 'parcel-20', pnu: '110101-20', lotNumber: '20', address: '장위동 20', areaSqm: 395, officialLandPricePerSqm: 2480000, landUseZone: '주거', buildingAge: 22, roadAccess: '양호', isInsideZone: true, geometry: parcelGeometry(127.0572, 37.6153) },
];
