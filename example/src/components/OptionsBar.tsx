import React, {useEffect} from 'react';
import styled from 'styled-components/macro';
import {useMapContext} from 'react-city-space-mapbox';
import BOSTON_PROXIMITY_RAW from '../data/boston-proximity-data.json';
import {createProximityScale, colorByCountryColorMap} from '../Utils';
import BauruData from '../data/bauru_data.json';
import useLayoutData from '../useLayoutData';
import {scaleLinear} from 'd3-scale';
import {extent} from 'd3-array';

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

const {cityGeoJson: cityMetaData} = BauruData;
const minMaxPopulation = extent(cityMetaData.features.map(f => f.properties.population)) as [number, number];
const populationScale = scaleLinear()
    .domain(minMaxPopulation)
    .range([16, 70]);
const minMaxGdpPpp = extent(cityMetaData.features.map(f => f.properties.gdpPpp)) as [number, number];
const gdpPppScale = scaleLinear()
    .domain(minMaxGdpPpp)
    .range([16, 70]);
const populationRadiusMap = cityMetaData.features.map(f => ({
  id: f.properties.id,
  radius: populationScale(f.properties.population),
}))
const gdpPppRadiusMap = cityMetaData.features.map(f => ({
  id: f.properties.id,
  radius: gdpPppScale(f.properties.gdpPpp),
}))
const uniformRadiusMap = cityMetaData.features.map(f => ({
  id: f.properties.id,
  radius: 20,
}))

const colorScale = createProximityScale([0, ...BOSTON_PROXIMITY_RAW.map(d => d.proximity), 1]);
const proximityColorMap = BOSTON_PROXIMITY_RAW.map(({partnerId, proximity}) => ({id: partnerId, color: colorScale(proximity)}));

const OptionsBar = () => {
  const mapContext = useMapContext();
  const {data} = useLayoutData();

  useEffect(() => {
    if (mapContext.intialized && data) {
      const currentCityFeature = data.cityGeoJson.features.find(({properties}: {properties: {id: string}}) => properties.id === '1022');
      if (currentCityFeature) {
        mapContext.setNewCenter(currentCityFeature.geometry.coordinates as any);
        mapContext.setHighlighted('1022');
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
  const onSizeByPopulation = () => {
    if (mapContext.intialized) {
      mapContext.setNodeSizing(populationRadiusMap);
    }
  }
  const onSizeByGdpPpp = () => {
    if (mapContext.intialized) {
      mapContext.setNodeSizing(gdpPppRadiusMap);
    }
  }
  const onSizeByUniform = () => {
    if (mapContext.intialized) {
      mapContext.setNodeSizing(uniformRadiusMap);
    }
  }
  const onFilter = () => {
    if (mapContext.intialized) {
      const minMaxPopulation: [number, number] = [
        246157.656242,
        40589878.1018
      ];
      const minMaxGdpPppPc: [number, number] = [
        629.5480072418245,
        98409.40985945992
      ];
      const selectedRegionIds: string[] = ["19"];
      mapContext.setFilterParamaters(minMaxPopulation, minMaxGdpPppPc, selectedRegionIds);
    }
  }

  return (
    <Root>
      <Button onClick={onGeoMapClick}>GeoMap</Button>
      <Button onClick={onUMapClick}>UMap</Button>
      <Button onClick={onColorByCountryClick}>Color By Country</Button>
      <Button onClick={onColorByCountryProximity}>Color By Proximity</Button>
      <Button onClick={onSizeByPopulation}>Size by Pop.</Button>
      <Button onClick={onSizeByGdpPpp}>Size by GDP PPP</Button>
      <Button onClick={onSizeByUniform}>Size by Uniform</Button>
      <Button onClick={onFilter}>Filter test</Button>
    </Root>
  );
}

export default OptionsBar;
