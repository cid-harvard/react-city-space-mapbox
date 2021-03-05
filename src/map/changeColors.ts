import mapboxgl from 'mapbox-gl';
import {MapMode} from './Utils';


interface Input {
  sourceId: string;
  map: mapboxgl.Map;
  mode: MapMode;
  colorMap: {id: string, color: string}[];
  cityGeoJson: mapboxgl.GeoJSONSourceOptions['data'];
  cityUMapJson: mapboxgl.GeoJSONSourceOptions['data'];
}

const changeColors = (input: Input) => {
  const {map, sourceId, colorMap, mode} = input;
  const defaultColor = '#F9E200';
  const cityGeoJson = input.cityGeoJson as any;
  const cityUMapJson = input.cityUMapJson as any;
  cityGeoJson.features.forEach((d: any) => {
    const newColorTarget = colorMap.find(c => c.id.toString() === d.properties.id.toString());
    d.properties = {...d.properties, fill: newColorTarget ? newColorTarget.color : defaultColor};
  })
  cityUMapJson.features.forEach((d: any) => {
    const newColorTarget = colorMap.find(c => c.id.toString() === d.properties.id.toString());
    d.properties = {...d.properties, fill: newColorTarget ? newColorTarget.color : defaultColor};
  })

  const source = map.getSource(sourceId);
  if (source) {
    const data = mode === MapMode.UMAP ? cityUMapJson : cityGeoJson;
    (source as any).setData({...data});
  }
}

export default changeColors;
