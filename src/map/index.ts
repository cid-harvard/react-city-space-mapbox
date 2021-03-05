import mapboxgl from 'mapbox-gl';
import bbox from '@turf/bbox';
import animatePoints from './animatePoints';
import initInteractions from './interactions';
import changeColors from './changeColors';
import changeOpacity from './changeOpacity';
import changeNodeSizing from './changeNodeSizing';
import {MapMode, defaultGeoJsonPoint} from './Utils';

interface Input {
  container: HTMLElement;
  mapStyle: string;
  accessToken: string;
  cityGeoJson: mapboxgl.GeoJSONSourceOptions['data'];
  cityUMapJson: mapboxgl.GeoJSONSourceOptions['data'];
  initialMode: MapMode;
  getPopupHTMLContent: undefined | ((datum: {id: string, country: string, city: string}) => string);
}

export interface Output {
  map: mapboxgl.Map;
  setToGeoMap: () => void;
  setToUMap: () => void;
  setColors: (colorMap: {id: string, color: string}[]) => void;
  setNodeSizing: (radiusMap: {id: string, radius: number}[]) => void;
  setNewCenter: (center: [number, number]) => void;
  setHighlighted: (id: number | string | null) => void;
  setFilterParamaters: (minMaxPopulation: [number, number], minMaxGdpPppPc: [number, number], regions: string[]) => void;
}

const cityNodesSourceId = 'city-nodes-source-id';
const highlightedNodeSourceId = 'highlighted-city-node-source-id';
const overlaySourceId = 'city-overlay-source-id';

const overlayPath = [
  [
    [-180, -90],
    [-180, 90],
    [180, 90],
    [180, -90],
    [-180, -90],
  ]
]
const hiddenCircle: mapboxgl.GeoJSONSourceOptions['data'] =
  {type: 'Feature', geometry: {type: 'Polygon', coordinates: overlayPath}, properties: {opacity: 0}};
const overlayCircle: mapboxgl.GeoJSONSourceOptions['data'] =
  {type: 'Feature', geometry: {type: 'Polygon', coordinates: overlayPath}, properties: {opacity: 1}};

const initMap = (input: Input): Output => {
  const {
    container, accessToken, cityGeoJson, cityUMapJson, initialMode, mapStyle,
    getPopupHTMLContent,
  } = input;
  mapboxgl.accessToken = accessToken;

  const geoBbox: any = bbox(cityGeoJson);
  const geoUMapBbox: any = bbox(cityUMapJson);

  const map = new mapboxgl.Map({
    container,
    style: mapStyle, // stylesheet location
    center: [0, 80], // starting position [lng, lat]
    zoom: 1.45, // starting zoom
    maxZoom: 15.5,
    bounds: geoBbox,
  });

  let mapLoaded = false;
  let centerOverride = false;

  map.on('load', () => {
    mapLoaded = true;
    if (!centerOverride) {
      map.fitBounds(geoBbox, {
        padding: 50,
        animate: true,
      });
    }

    map.addSource(overlaySourceId, {
      type: 'geojson',
      data: initialMode === MapMode.GEO ? hiddenCircle : overlayCircle,
    });

    map.addLayer({
      id: overlaySourceId,
      type: 'fill',
      source: overlaySourceId,
      paint: {
        'fill-color': '#fff',
        'fill-opacity': ['get', 'opacity'],
      }
    });

    map.addSource(cityNodesSourceId, {
      type: 'geojson',
      data: initialMode === MapMode.GEO ? cityGeoJson : cityUMapJson,
    });

    map.addLayer({
      id: cityNodesSourceId,
      type: 'circle',
      source: cityNodesSourceId,
      paint: {
        // make circles larger as the user zooms from z12 to z22
        // 'circle-radius': [
        //   'interpolate',
        //   ['linear', 1.96],
        //   ['zoom'],
        //   0, 2,
        //   22, 20,
        // ],
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          0, ['/', ['get', 'radius'], 12],
          22, ['/', ['get', 'radius'], 1.25],
        ],
        'circle-color': ['get', 'fill'],
        'circle-opacity': ['get', 'opacity'],
      },
    });

    map.addSource(highlightedNodeSourceId, {
      type: 'geojson',
      data: defaultGeoJsonPoint,
    });

    map.addLayer({
      id: highlightedNodeSourceId,
      type: 'symbol',
      source: highlightedNodeSourceId,
        layout: {
          'icon-image': ['get', 'icon'],
          'icon-size': [
              'interpolate',
              ['exponential', 0.96],
              ['zoom'],
              0,
              0.5,
              22,
              2,
          ],
          'icon-offset': [0, -15],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
      }
    });

    initInteractions({map, sourceId: cityNodesSourceId, getPopupHTMLContent});
  });

  let mode: MapMode = initialMode;
  let highlightedId: string | number | null = null;

  const setToGeoMap = () => {
    if (mapLoaded) {
      map.setRenderWorldCopies(true);
      const duration = 200;
      map.fitBounds(geoBbox, {
        padding: {top: 100, bottom:0, left: 50, right: 50},
        animate: true,
        duration,
      });
      setTimeout(() => {
        animatePoints({
          start: cityUMapJson,
          end: cityGeoJson,
          sourceId: cityNodesSourceId,
          map, highlightedId,
          highlightedSourceId: highlightedNodeSourceId,
        });
      }, duration)
      const overlaySource = map.getSource(overlaySourceId);
      if (overlaySource) {
        (overlaySource as any).setData(hiddenCircle);
      }
      mode = MapMode.GEO;
    }
  };

  const setToUMap = () => {
    if (mapLoaded) {
      map.setRenderWorldCopies(false);
      const duration = 200;
      map.fitBounds(geoUMapBbox, {
        padding: {top: 100, bottom:0, left: 50, right: 50},
        animate: true,
        duration,
      });
      setTimeout(() => {
        animatePoints({
          start: cityGeoJson,
          end: cityUMapJson,
          sourceId: cityNodesSourceId,
          map, highlightedId,
          highlightedSourceId: highlightedNodeSourceId,
        })
      }, duration)
      const overlaySource = map.getSource(overlaySourceId);
      if (overlaySource) {
        (overlaySource as any).setData(overlayCircle);
      }
      mode = MapMode.UMAP;
    }
  };

  const setColors = (colorMap: {id: string, color: string}[]) => {
    changeColors({
      sourceId: cityNodesSourceId,
      map, colorMap, mode,
      cityGeoJson,
      cityUMapJson,
    });
  }

  const setNodeSizing = (radiusMap: {id: string, radius: number}[]) => {
    changeNodeSizing({
      sourceId: cityNodesSourceId,
      map, radiusMap, mode,
      cityGeoJson,
      cityUMapJson,
    });
  }

  const setNewCenter = (center: [number, number]) => {
    if (mode === MapMode.GEO) {
      centerOverride = true;
      map.jumpTo({
        center,
        zoom: 3,
      });
    }
  };

  const setHighlighted = (id: number | string | null) => {
    const updateHighlightedPointSource = () => {
      const source = map.getSource(highlightedNodeSourceId);
      if (id !== null && source) {
        highlightedId = id;
        const data: any = mode === MapMode.UMAP ? cityUMapJson : cityGeoJson;
        const targetPoint = data.features.find((d: any) => d.properties.id.toString() === id.toString());
        if (targetPoint) {
          const properties = {
            ...targetPoint.properties,
            icon: 'arrow_down',
          };
          (source as any).setData({
            ...targetPoint,
            properties,
          });
        }
      } else if (source) {
        (source as any).setData(defaultGeoJsonPoint);
      }
    }

    if (mapLoaded) {
      updateHighlightedPointSource();
    } else {
      const updateHighlightedPointSourceOnLoad = () => {
        updateHighlightedPointSource();
        map.off('load', updateHighlightedPointSourceOnLoad);
      };
      map.on('load', updateHighlightedPointSourceOnLoad);
    }
  };

  const setFilterParamaters = ( 
    minMaxPopulation: [number, number],
    minMaxGdpPppPc: [number, number],
    regions: string[]) => {
      changeOpacity({
        sourceId: cityNodesSourceId,
        map, mode,
        cityGeoJson,
        cityUMapJson,
        minMaxPopulation,
        minMaxGdpPppPc,
        regions,
      });
  }

  return {
    map, setToGeoMap, setToUMap, setColors, setNewCenter, setHighlighted, setNodeSizing, setFilterParamaters,
  };
};

export default initMap;
