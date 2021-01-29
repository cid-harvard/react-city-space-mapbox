# react-city-space-mapbox

## by the Growth Lab at Harvard's Center for International Development

Visualize the City Space using Mapbox

> This package is part of Harvard Growth Lab’s portfolio of software packages, digital products and interactive data visualizations. To browse our entire portfolio, please visit The Viz Hub at [growthlab.app](https://growthlab.app/). To learn more about our research, please visit [Harvard Growth Lab’s](https://growthlab.cid.harvard.edu/) home page.

### [View live example ↗](https://cid-harvard.github.io/react-city-space-mapbox/)

[![NPM](https://img.shields.io/npm/v/react-city-space-mapbox.svg)](https://www.npmjs.com/package/react-city-space-mapbox) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-city-space-mapbox
```

## Usage

```tsx
import React, {useRef} from 'react'
import OptionsBar from './OptionsBar' // child components can use the map context to trigger events
import CitySpaceMap from 'react-city-space-mapbox'

const App = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  return (
    <React.Fragment>
      <CitySpaceMap
        accessToken={accessToken}
        rootRef={rootRef}
        cityGeoJson={cityGeoJson}
        cityUMapJson={cityUMapJson}
      >
        <OptionsBar />
      </CitySpaceMap>
      <Root ref={rootRef} />
    </React.Fragment>
  );
}

export default App
```

## License

MIT © [The President and Fellows of Harvard College](https://www.harvard.edu/)
