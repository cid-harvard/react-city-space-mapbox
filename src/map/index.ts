import mapboxgl from 'mapbox-gl';

interface Input {
  container: HTMLElement;
  accessToken: string;
  cityGeoJson: mapboxgl.GeoJSONSourceOptions['data'];
  cityUMapJson: mapboxgl.GeoJSONSourceOptions['data'];
}

export interface Output {
  map: mapboxgl.Map;
  setToGeoMap: () => void;
  setToUMap: () => void;
}

const cityNodesSourceId = 'city-nodes-source-id';
const overlaySourceId = 'city-overlay-source-id';

const bounds: [[number, number], [number, number]] = [[-180, -80], [180, 80]];

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

const initMap = ({container, accessToken, cityGeoJson, cityUMapJson}: Input): Output => {
  mapboxgl.accessToken = accessToken;

  const map = new mapboxgl.Map({
    container,
    style: 'mapbox://styles/harvardgrowthlab/ckelvcgh70cg019qgiu39035a', // stylesheet location
    center: [0, 80], // starting position [lng, lat]
    zoom: 1.45, // starting zoom
    maxZoom: 15.5,
    renderWorldCopies: false,
    maxBounds: bounds,
  });

  let mapLoaded = false;

  map.on('load', () => {
    mapLoaded = true;

    map.addSource(overlaySourceId, {
      type: 'geojson',
      data: hiddenCircle,
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
      data: cityGeoJson,
    });

    map.addLayer({
      id: cityNodesSourceId,
      type: 'circle',
      source: cityNodesSourceId,
      paint: {
        // make circles larger as the user zooms from z12 to z22
        'circle-radius': [
          'interpolate',
          ['linear', 1.96],
          ['zoom'],
          0, 2,
          22, 20,
        ],
        'circle-color': [
          'match',
          ['get', 'country'],
            "United States",
            "#696969",
            "Canada",
            "#1E90FF",
            "Peru",
            "#B22222",
            "Brazil",
            "#D2691E",
            "Chile",
            "#228B22",
            "Argentina",
            "#FF00FF",
            "Spain",
            "#DCDCDC",
            "Morocco",
            "#32CD32",
            "Portugal",
            "#FFD700",
            "United Kingdom",
            "#DAA520",
            "France",
            "#808080",
            "Belgium",
            "#808080",
            "Germany",
            "#008000",
            "Italy",
            "#ADFF2F",
            "Norway",
            "#F0FFF0",
            "Sweden",
            "#FF69B4",
            "Denmark",
            "#CD5C5C",
            "Czech Republic",
            "#4B0082",
            "Slovenia",
            "#FFFFF0",
            "Poland",
            "#F0E68C",
            "Austria",
            "#E6E6FA",
            "Croatia",
            "#FFF0F5",
            "Russia",
            "#7CFC00",
            "Hungary",
            "#FFFACD",
            "Finland",
            "#ADD8E6",
            "Estonia",
            "#F08080",
            "Latvia",
            "#E0FFFF",
            "Lithuania",
            "#FAFAD2",
            "Greece",
            "#D3D3D3",
            "Romania",
            "#D3D3D3",
            "Israel",
            "#90EE90",
            "India",
            "#FFB6C1",
            "China",
            "#FFA07A",
            "Thailand",
            "#20B2AA",
            "Singapore",
            "#87CEFA",
            "Taiwan",
            "#778899",
            "Japan",
            "#778899",
            "Philippines",
            "#B0C4DE",
          /* other */ '#333'
          ]
      },
    });
  });

  console.log({cityGeoJson, cityUMapJson});

  const setToGeoMap = () => {
    if (mapLoaded) {
      (map.getSource(cityNodesSourceId) as any).setData(cityGeoJson)
      const overlaySource = map.getSource(overlaySourceId);
      if (overlaySource) {
        (overlaySource as any).setData(hiddenCircle);
      }
    }
  };

  const setToUMap = () => {
    if (mapLoaded) {
      (map.getSource(cityNodesSourceId) as any).setData(cityUMapJson)
      const overlaySource = map.getSource(overlaySourceId);
      if (overlaySource) {
        (overlaySource as any).setData(overlayCircle);
      }
    }
  };

  return {
    map, setToGeoMap, setToUMap,
  };
};

export default initMap;
