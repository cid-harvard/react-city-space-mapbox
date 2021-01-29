import React, {useRef} from 'react'
import CitySpaceMap from 'react-city-space-mapbox'
import styled from 'styled-components/macro';
import OptionsBar from './components/OptionsBar';
import CITIES_GEOJSON_RAW from './data/cities-geojson.json';
import CITIES_UMAPJSON_RAW from './data/cities-umap.json';
import {scaleLinear} from 'd3-scale';
import {extent} from 'd3-array';

const {point, featureCollection} = require('@turf/helpers');
const centroid = require('@turf/centroid').default;

const allLatCoords: number[] = [];
const allLngCoords: number[] = [];

const cityGeoJson = featureCollection((CITIES_GEOJSON_RAW as any).features.map((feature: any) => {
  const {ID_HDC_G0: id, CTR_MN_NM: country, UC_NM_MN: city } = feature.properties;
  const point = centroid(feature, {properties: {id, country, city}})
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
  .range([minMaxLat[0] * 1, minMaxLat[1] * 1.2]);

const minMaxLng = extent(allLngCoords) as [number, number];
const xToLngScale = scaleLinear()
  .domain(extent(uMapXCoords) as [number, number])
  .range([minMaxLng[0] * 0.9, minMaxLng[1] * 1]);

const cityUMapJson = featureCollection(CITIES_UMAPJSON_RAW.map(n => {
  const {x, y, ID_HDC_G0: id, CTR_MN_NM: country, UC_NM_MN: city } = n;
  return point([xToLngScale(x), yToLatScale(y)], {id, country, city})
}));

const Root = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
`;

const accessToken =
  'pk.eyJ1IjoiaGFydmFyZGdyb3d0aGxhYiIsImEiOiJja2tpaXkya2IwOW5mMnBvaTNjMHlsYjNpIn0.3xPcnwP6dHcC5HGXyoKDIQ';

const App = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  return (
    <React.Fragment>
      <CitySpaceMap
        accessToken={accessToken}
        rootRef={rootRef}
        cityGeoJson={cityGeoJson}
        cityUMapJson={cityUMapJson}
      >
        <OptionsBar />
      </CitySpaceMap>
      <Root ref={rootRef} />
    </React.Fragment>
  );
}

export default App
