import 'mapbox-gl/dist/mapbox-gl.css';
import React, {useEffect, useState, createContext, useContext} from 'react';
import initMap, {Output} from './map';

type MapState = { intialized: false } | ( {intialized: true} & Output);
const MapContext = createContext<MapState>({intialized: false});

export const useMapContext = () => {
  const mapContext = useContext(MapContext);
  return mapContext;
};

interface Props {
  accessToken: string;
  rootRef: React.MutableRefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  cityGeoJson: mapboxgl.GeoJSONSourceOptions['data'];
  cityUMapJson: mapboxgl.GeoJSONSourceOptions['data'];
}

const CitySpaceMap = (props: Props) => {
  const {accessToken, rootRef, children, cityGeoJson, cityUMapJson} = props;
  const [mapState, setMapState] = useState<MapState>({intialized: false});

  useEffect(() => {
    const container = rootRef.current;
    if (container && !mapState.intialized) {
      const mapOutput = initMap({container, accessToken, cityGeoJson, cityUMapJson});
      setMapState({intialized: true, ...mapOutput});
    }
  }, [rootRef, mapState]);

  return (
    <MapContext.Provider value={mapState}>
      {children}
    </MapContext.Provider>
  );
};

export default CitySpaceMap;
