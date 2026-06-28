'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { mockParcels } from '@/src/data/mockParcels';
import { mockZones } from '@/src/data/mockZones';
import type { ParcelFeature } from '@/src/types/parcel';
import type { ZoneFeature } from '@/src/types/zone';

interface MapViewProps {
  selectedParcels: ParcelFeature[];
  selectionMode: boolean;
  onSelectZone: (zone: ZoneFeature) => void;
  onToggleParcel: (parcel: ParcelFeature) => void;
}

const toParcelFeatureCollection = (selectedParcels: ParcelFeature[]) => ({
  type: 'FeatureCollection' as const,
  features: mockParcels.map((parcel) => ({
    type: 'Feature' as const,
    properties: { id: parcel.id, selected: selectedParcels.some((item) => item.id === parcel.id) },
    geometry: parcel.geometry,
  })),
});

export default function MapView({ selectedParcels, selectionMode, onSelectZone, onToggleParcel }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const selectionModeRef = useRef(selectionMode);
  const onSelectZoneRef = useRef(onSelectZone);
  const onToggleParcelRef = useRef(onToggleParcel);

  useEffect(() => {
    selectionModeRef.current = selectionMode;
  }, [selectionMode]);

  useEffect(() => {
    onSelectZoneRef.current = onSelectZone;
  }, [onSelectZone]);

  useEffect(() => {
    onToggleParcelRef.current = onToggleParcel;
  }, [onToggleParcel]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [127.055, 37.609],
      zoom: 14,
      pitch: 0,
    });

    mapRef.current = map;

    map.on('load', () => {
      map.addSource('zones', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: mockZones.map((zone) => ({
            type: 'Feature',
            properties: { id: zone.id, name: zone.name, type: zone.projectType },
            geometry: zone.geometry,
          })),
        },
      });

      map.addSource('parcels', {
        type: 'geojson',
        data: toParcelFeatureCollection([]),
      });

      map.addLayer({
        id: 'zone-layer',
        type: 'fill',
        source: 'zones',
        paint: {
          'fill-color': ['match', ['get', 'type'], '재개발', '#2563eb', '재건축', '#7c3aed', '가로주택정비', '#16a34a', '소규모재건축', '#fbbf24', '#6b7280'],
          'fill-opacity': 0.22,
          'fill-outline-color': '#111827',
        },
      });

      map.addLayer({
        id: 'parcel-layer',
        type: 'fill',
        source: 'parcels',
        paint: {
          'fill-color': '#f59e0b',
          'fill-opacity': 0.18,
          'fill-outline-color': '#92400e',
        },
      });

      map.addLayer({
        id: 'selected-parcel-layer',
        type: 'fill',
        source: 'parcels',
        paint: {
          'fill-color': '#ef4444',
          'fill-opacity': 0.45,
          'fill-outline-color': '#b91c1c',
        },
        filter: ['==', ['get', 'selected'], true],
      });

      map.on('click', 'zone-layer', (event) => {
        const feature = event.features?.[0];
        const zone = mockZones.find((item) => item.id === feature?.properties?.id);
        if (zone) onSelectZoneRef.current(zone);
      });

      const handleParcelClick = (event: maplibregl.MapLayerMouseEvent) => {
        if (!selectionModeRef.current) return;

        const feature = event.features?.[0];
        const parcel = mockParcels.find((item) => item.id === feature?.properties?.id);
        if (parcel) onToggleParcelRef.current(parcel);
      };

      map.on('click', 'parcel-layer', handleParcelClick);
      map.on('click', 'selected-parcel-layer', handleParcelClick);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const source = map?.getSource('parcels') as maplibregl.GeoJSONSource | undefined;
    source?.setData(toParcelFeatureCollection(selectedParcels));
  }, [selectedParcels]);

  return (
    <section className="rounded-2xl bg-white p-3 shadow">
      <div ref={mapContainerRef} className="h-[70vh] w-full rounded-xl" />
    </section>
  );
}
