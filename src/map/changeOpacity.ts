import mapboxgl from 'mapbox-gl';
import {MapMode} from './Utils';


interface Input {
  sourceId: string;
  map: mapboxgl.Map;
  mode: MapMode;
  cityGeoJson: mapboxgl.GeoJSONSourceOptions['data'];
  cityUMapJson: mapboxgl.GeoJSONSourceOptions['data'];
  minMaxPopulation: [number, number];
  minMaxGdpPppPc: [number, number];
  regions: string[];
}

const changeOpacity = (input: Input) => {
  const {map, sourceId, minMaxPopulation, minMaxGdpPppPc, regions, mode} = input;
  const [minPop, maxPop] = minMaxPopulation;
  const [minGdpPppPc, maxGdpPppPc] = minMaxGdpPppPc;
  const cityGeoJson = input.cityGeoJson as any;
  const cityUMapJson = input.cityUMapJson as any;
  cityGeoJson.features.forEach((d: any) => {
    if (!isNaN(d.properties.population) && !isNaN(d.properties.gdpPpp)) {
      const population = d.properties.population;
      const gdpPppPc = d.properties.gdpPpp / population;
      const opacity =
        population >= minPop && population <= maxPop &&
        gdpPppPc >= minGdpPppPc && gdpPppPc <= maxGdpPppPc &&
        (!regions.length || (d.properties.region !== null && regions.includes(d.properties.region.toString()))) ? 1 : 0;
      d.properties = {...d.properties, opacity};
    }
  })
  cityUMapJson.features.forEach((d: any) => {
    if (!isNaN(d.properties.population) && !isNaN(d.properties.gdpPpp)) {
      const population = d.properties.population;
      const gdpPppPc = d.properties.gdpPpp / population;
      const opacity =
        population >= minPop && population <= maxPop &&
        gdpPppPc >= minGdpPppPc && gdpPppPc <= maxGdpPppPc &&
        (!regions.length || (d.properties.region !== null && regions.includes(d.properties.region.toString()))) ? 1 : 0;
      d.properties = {...d.properties, opacity};
    }
  })

  const source = map.getSource(sourceId);
  if (source) {
    const data = mode === MapMode.UMAP ? cityUMapJson : cityGeoJson;
    (source as any).setData({...data});
  }
}

export default changeOpacity;
