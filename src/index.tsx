import 'mapbox-gl/dist/mapbox-gl.css';
import React, {useEffect, useState, createContext, useContext} from 'react';
import initMap, {Output} from './map';
import {MapMode} from './map/Utils';

type MapState = { intialized: false } | ( {intialized: true} & Output);
const MapContext = createContext<MapState>({intialized: false});

const useMapContext = () => {
  const mapContext = useContext(MapContext);
  return mapContext;
};

interface Props {
  accessToken: string;
  mapStyle: string;
  rootRef: React.MutableRefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  cityGeoJson: mapboxgl.GeoJSONSourceOptions['data'] | undefined;
  cityUMapJson: mapboxgl.GeoJSONSourceOptions['data'] | undefined;
  initialMode?: MapMode;
  getPopupHTMLContent?: undefined | ((datum: {id: string, country: string, city: string}) => string);
}

const CitySpaceMap = (props: Props) => {
  const {
    accessToken, rootRef, children, cityGeoJson, cityUMapJson, initialMode, mapStyle,
    getPopupHTMLContent,
  } = props;
  const [mapState, setMapState] = useState<MapState>({intialized: false});

  useEffect(() => {
    const container = rootRef.current;
    if (container && !mapState.intialized && cityGeoJson && cityUMapJson) {
      const mapOutput = initMap({
        container, accessToken, cityGeoJson, cityUMapJson,
        initialMode: initialMode ? initialMode : MapMode.GEO,
        mapStyle, getPopupHTMLContent
      });
      setMapState({intialized: true, ...mapOutput});
    }
  }, [rootRef, mapState, cityGeoJson, cityUMapJson, initialMode, mapStyle, getPopupHTMLContent]);

  return (
    <MapContext.Provider value={mapState}>
      {children}
    </MapContext.Provider>
  );
};

export {
  MapMode,
  useMapContext,
};

export default CitySpaceMap;
