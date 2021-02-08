import mapboxgl from 'mapbox-gl';

export enum MapMode {
  GEO = 'GEO',
  UMAP = 'UMAP',
}

export const defaultGeoJsonPoint: mapboxgl.GeoJSONSourceOptions['data'] = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Point',
    coordinates: [],
  },
};
