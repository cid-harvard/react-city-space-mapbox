import mapboxgl from 'mapbox-gl';
import {lineString, featureCollection, point} from '@turf/helpers';
import length from '@turf/length';
import along from '@turf/along';

interface Input {
  start: mapboxgl.GeoJSONSourceOptions['data'];
  end: mapboxgl.GeoJSONSourceOptions['data'];
  sourceId: string;
  map: mapboxgl.Map;
}

interface PointFeature {
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [number, number],
  },
  properties: {
    id: string,
    country: string,
    city: string,
  }
}

interface LineStringFeature {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [number, number][],
  },
  properties: {
    id: string,
    country: string,
    city: string,
  }
}

const steps = 120;

const animatePoints = (input: Input) => {
  const {map, sourceId} = input;
  const start = input.start as any;
  const end = input.end as any;

  const routes = {
    ...start.features,
    features: start.features.map((startFeature: PointFeature) => {
      const endFeature: PointFeature =
        end.features.find((f: PointFeature) => f.properties.id === startFeature.properties.id);
      const route = lineString(
        [startFeature.geometry.coordinates, endFeature.geometry.coordinates],
        {...startFeature.properties},
      );
      const lineDistance = length(route);
      const arc: [number, number][] = [];
      for (let i = 0; i < lineDistance; i += lineDistance / steps) {
        const segment = along(route, i);
        arc.push(segment.geometry.coordinates as [number, number]);
      }
      route.geometry.coordinates = arc;
      return route;
    }),
  }

  let counter = 0;
  let ease = 1;
  function animate() {
    const index = counter >= steps ? steps - 1 : Math.floor(counter);
    const points = routes.features.map((feature: LineStringFeature) => {
      return point(
        feature.geometry.coordinates[index],
        {...feature.properties}
      )
    });

    const source = map.getSource(sourceId);
    if (source) {
      (source as any).setData(featureCollection(points));
    }
   
    // Request the next frame of animation as long as the end has not been reached
    if (counter < steps) {
      requestAnimationFrame(animate);
    } else {
      const source = map.getSource(sourceId);
      if (source) {
        (source as any).setData(end);
      }
    }
    ease = counter < steps / 2 ? ease * 1.09 : ease * 0.92;
    counter = counter + ease;
  }
  animate();
}

export default animatePoints;
