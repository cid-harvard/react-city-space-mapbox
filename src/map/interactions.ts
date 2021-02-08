import mapboxgl from 'mapbox-gl';

interface Input {
  map: mapboxgl.Map;
  sourceId: string;
  getPopupHTMLContent: undefined | ((datum: {id: string, country: string, city: string}) => string);
}

const initInteractions = (input: Input) => {
  const {
    map, sourceId, getPopupHTMLContent,
  } = input;

  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', sourceId, (e) => {
    map.getCanvas().style.cursor = 'pointer';

    const coordinates = (e.features as any)[0].geometry.coordinates.slice();
    const city = (e.features as any)[0].properties.city;
    const country = (e.features as any)[0].properties.country;
    const locationText = city + ', ' + country;
    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    const popupContent = getPopupHTMLContent ? getPopupHTMLContent((e.features as any)[0].properties) : locationText;
     
    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(coordinates).setHTML(popupContent).addTo(map);
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', sourceId, () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

};

export default initInteractions;
