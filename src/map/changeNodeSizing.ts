import mapboxgl from 'mapbox-gl';
import {MapMode} from './Utils';


interface Input {
  sourceId: string;
  map: mapboxgl.Map;
  mode: MapMode;
  radiusMap: {id: string, radius: number}[];
  cityGeoJson: mapboxgl.GeoJSONSourceOptions['data'];
  cityUMapJson: mapboxgl.GeoJSONSourceOptions['data'];
}

const changeNodeSizing = (input: Input) => {
  const {map, sourceId, radiusMap, mode} = input;
  const defaultRadius = 20;
  const cityGeoJson = input.cityGeoJson as any;
  const cityUMapJson = input.cityUMapJson as any;
  cityGeoJson.features.map((d: any) => {
    const newRadiusTarget = radiusMap.find(c => c.id.toString() === d.properties.id.toString());
    d.properties = {...d.properties, radius: newRadiusTarget ? newRadiusTarget.radius : defaultRadius};
  })
  cityUMapJson.features.map((d: any) => {
    const newRadiusTarget = radiusMap.find(c => c.id.toString() === d.properties.id.toString());
    d.properties = {...d.properties, radius: newRadiusTarget ? newRadiusTarget.radius : defaultRadius};
  })

  const source = map.getSource(sourceId);
  if (source) {
    const data = mode === MapMode.UMAP ? cityUMapJson : cityGeoJson;
    (source as any).setData({...data});
  }
}

export default changeNodeSizing;
