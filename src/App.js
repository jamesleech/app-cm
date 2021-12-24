import React, { useState } from "react";
import 'mapbox-gl/dist/mapbox-gl.css'; // eslint-disable-line import/no-webpack-loader-syntax
import DeckGL from "@deck.gl/react";
import { MapView } from "@deck.gl/core";
import { ScatterplotLayer } from "@deck.gl/layers";
import { StaticMap } from "!react-map-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { useSites } from "./useSites";
import { SuburbInfo } from "./SuburbInfo";

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: 140,
  latitude: -28,
  zoom: 3.5,
  pitch: 0,
  bearing: 0
};

const getTooltip = ({object}) => {
  return object && `${object.postcode}\n${object.suburb}`;
};

function App() {
  // const {latitude, longitude, zoom} = usePosition();
  const {sites} = useSites();
  const [selected, setSelected] = useState({});

  const handlePointHover = ({object}) => {
    if (!!object && object !== selected) {
      setSelected(object);
    }
    return true;
  };

  return sites?.length > 0 ?
    <div>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        layers={sites.map(s => new ScatterplotLayer(
          {
            ...s,
            pickable: true,
            onHover: handlePointHover,
          }))}
        getTooltip={getTooltip}
        controller={true}>
        <MapView id="map" x="25%" width="75%" controller={true}>
          <StaticMap
            // mapStyle="mapbox://styles/mapbox/dark-v9"
            mapStyle="mapbox://styles/mapbox/streets-v9"
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
          />
        </MapView>
      </DeckGL>
      <SuburbInfo width="25%" {...selected} />
    </div> : <div/>;
}

export default App;
