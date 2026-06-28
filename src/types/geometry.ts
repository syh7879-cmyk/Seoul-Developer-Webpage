export type Position = [number, number];

export interface PolygonGeometry {
  type: 'Polygon';
  coordinates: Position[][] | number[][][];
}

export interface MultiPolygonGeometry {
  type: 'MultiPolygon';
  coordinates: Position[][][] | number[][][][];
}
