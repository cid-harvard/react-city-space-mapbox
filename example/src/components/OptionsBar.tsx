import React from 'react';
import styled from 'styled-components/macro';
import {useMapContext} from 'react-city-space-mapbox'

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

const OptionsBar = () => {
  const mapContext = useMapContext();

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

  return (
    <Root>
      <Button onClick={onGeoMapClick}>GeoMap</Button>
      <Button onClick={onUMapClick}>UMap</Button>
    </Root>
  );
}

export default OptionsBar;
