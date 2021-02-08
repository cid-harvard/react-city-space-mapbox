import React, {useEffect} from 'react';
import styled from 'styled-components/macro';
import {useMapContext} from 'react-city-space-mapbox';
import BOSTON_PROXIMITY_RAW from '../data/boston-proximity-data.json';
import {createProximityScale, colorByCountryColorMap} from '../Utils';
import useLayoutData from '../useLayoutData';

const Root = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  margin: auto;
  z-index: 100;
  display: flex;
  justify-content: center;
  pointer-events: none;
`;

const Button = styled.button`
  pointer-events: all;
  display: flex;
  align-items: center;
  margin: 1rem;
  text-transform: uppercase;
  font-size: 1.5rem;
  font-family: monospace;
  background-color: #fff;
  border: solid 1px #dfdfdf;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 1;
  flex-grow: 0;
  flex-basis: 1;
  width: min-content;
  padding: 1rem;
  white-space: pre-wrap;
  cursor: pointer;
`;

const colorScale = createProximityScale([0, ...BOSTON_PROXIMITY_RAW.map(d => d.proximity), 1]);
const proximityColorMap = BOSTON_PROXIMITY_RAW.map(({partnerId, proximity}) => ({id: partnerId, color: colorScale(proximity)}));

const OptionsBar = () => {
  const mapContext = useMapContext();
  const {data} = useLayoutData();

  useEffect(() => {
    if (mapContext.intialized && data) {
      const currentCityFeature = data.cityGeoJson.features.find(({properties}: {properties: {id: number}}) => properties.id === 1022);
      if (currentCityFeature) {
        mapContext.setNewCenter(currentCityFeature.geometry.coordinates);
        mapContext.setHighlighted(1022);
      }
    }
  })

  const onGeoMapClick = () => {
    if (mapContext.intialized) {
      mapContext.setToGeoMap();
    }
  }

  const onUMapClick = () => {
    if (mapContext.intialized) {
      mapContext.setToUMap();
    }
  }

  const onColorByCountryClick = () => {
    if (mapContext.intialized && data) {
      const countryColorMap = data.cityGeoJson.features.map((d: any) => {
        const country = colorByCountryColorMap.find(c => c.id === d.properties.country);
        return {
          id: d.properties.id,
          color: country ? country.color : 'gray',
        }
      })
      mapContext.setColors(countryColorMap);
    }
  }

  const onColorByCountryProximity = () => {
    if (mapContext.intialized) {
      mapContext.setColors(proximityColorMap);
    }
  }

  return (
    <Root>
      <Button onClick={onGeoMapClick}>GeoMap</Button>
      <Button onClick={onUMapClick}>UMap</Button>
      <Button onClick={onColorByCountryClick}>Color By Country</Button>
      <Button onClick={onColorByCountryProximity}>Color By Proximity</Button>
    </Root>
  );
}

export default OptionsBar;
