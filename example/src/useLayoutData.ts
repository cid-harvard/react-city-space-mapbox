import {useState, useEffect} from 'react';
import CITIES_GEOJSON_RAW from './data/cities-geojson.json';
import CITIES_UMAPJSON_RAW from './data/cities-umap.json';
import {scaleLinear} from 'd3-scale';
import {extent} from 'd3-array';
import {colorByCountryColorMap} from './Utils';

const {point, featureCollection} = require('@turf/helpers');
const centroid = require('@turf/centroid').default;

interface Output {
  loading: boolean;
  error: any | undefined;
  data: {
    cityGeoJson: any;
    cityUMapJson: any;
  } | undefined;
}

const useLayoutData = () => {
  const [output, setOutput] = useState<Output>({loading: true, error: undefined, data: undefined});

  useEffect(() => {
    setTimeout(() => {

      const allLatCoords: number[] = [];
      const allLngCoords: number[] = [];

      const cityGeoJson = featureCollection((CITIES_GEOJSON_RAW as any).features.map((feature: any) => {
        const {ID_HDC_G0: id, CTR_MN_NM: country, UC_NM_MN: city } = feature.properties;
        const colorNode = colorByCountryColorMap.find(c => c.id === country);
        const fill = colorNode ? colorNode.color : 'gray';
        const point = centroid(feature, {properties: {id, country, city, fill}})
        allLngCoords.push(point.geometry.coordinates[0]);
        allLatCoords.push(point.geometry.coordinates[1]);
        return point;
      }));


      const uMapXCoords: number[] = [];
      const uMapYCoords: number[] = [];
      CITIES_UMAPJSON_RAW.forEach(({x, y}) => {
        uMapXCoords.push(x);
        uMapYCoords.push(y);
      });


      const minMaxLat = extent(allLatCoords) as [number, number];
      const yToLatScale = scaleLinear()
        .domain(extent(uMapYCoords) as [number, number])
        .range([minMaxLat[0] * 1.65, minMaxLat[1] * 1.2]);

      const minMaxLng = extent(allLngCoords) as [number, number];
      const xToLngScale = scaleLinear()
        .domain(extent(uMapXCoords) as [number, number])
        .range([minMaxLng[0] * 0.9, minMaxLng[1] * 1]);

      const cityUMapJson = featureCollection(CITIES_UMAPJSON_RAW.map(n => {
        const {x, y, ID_HDC_G0: id, CTR_MN_NM: country, UC_NM_MN: city } = n;
        const colorNode = colorByCountryColorMap.find(c => c.id === country);
        const fill = colorNode ? colorNode.color : 'gray';
        return point([xToLngScale(x), yToLatScale(y)], {id, country, city, fill})
      }));

      setOutput({loading: false, error: undefined, data: {cityUMapJson, cityGeoJson}});
    }, 200)
  }, [])

  return output;
}

export default useLayoutData;
