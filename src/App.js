import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import getToken from "./Component/Auth";
import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import TileWMS from "ol/source/TileWMS.js";
import OSM from "ol/source/OSM.js";
import { get as getProjection, transformExtent } from "ol/proj";
import Ozone from "./Component/Ozone";
import SentApi from "./Component/SentApi";
import Countreis from "./Component/Countreis";
import fetchCountryBoundingBox from "./Component/Search";
function App() {
  // const MySentApi = Countreis();
  const mapRef = useRef(null);
  const [FDate, setFDate] = useState("");
  const [TDate, setTDate] = useState("");
  function moveMapToCountry(bbox) {
    const extent = transformExtent(bbox, "EPSG:4326", "EPSG:3857");
    mapRef.current.getView().fit(extent, { duration: 1000 });
  }
  useEffect(() => {
    document.onclick = (e) => {
      const searchDropdown = document.getElementById("search-dropdown");
      if (e.target.id !== "search-input") {
        searchDropdown.style.display = "none";
      } else {
        searchDropdown.style.display = "inline-block";
      }
    };
    const map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        // new TileLayer({
        //   extent: [246881.59, 2199781.32, 368037.56, 3162315.47],
        //   source: new TileWMS({
        //     url: "https://creodias.sentinel-hub.com/ogc/wms/983191c2-c5ad-4eb4-87cc-22280a3fc1d9",
        //     params: {
        //       TIME: `${fromTime}/${toTime}`, // Specify the time range
        //       LAYERS: "NITROGEN-DIOXIDE",
        //       MAXCC: 20,
        //       CRS: "EPSG:3857",
        //     },
        //     attributions: "Sentinel-Hub",
        //     serverType: "geoserver",
        //     crossOrigin: "anonymous",
        //     projection: getProjection("EPSG:3857"), // Set the projection explicitly
        //   }),
        // }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 1,
      }),
    });
    mapRef.current = map;
    return () => {
      map.setTarget(null);
    };
  }, []);
  function createCustomTileLayer(bbox) {
    const extent = transformExtent(bbox, "EPSG:4326", "EPSG:3857");
    const fromTime = `${FDate}T00:00:00Z`; // Specify the start time
    const toTime = `${TDate}T00:00:00Z`; // Specify the end time
    return new TileLayer({
      extent: extent,
      name: "NITROGEN-DIOXIDE",
      source: new TileWMS({
        url: "https://creodias.sentinel-hub.com/ogc/wms/983191c2-c5ad-4eb4-87cc-22280a3fc1d9",
        params: {
          TIME: `${fromTime}/${toTime}`, // Specify the time range
          LAYERS: "NITROGEN-DIOXIDE",
          MAXCC: 20,
          crs: "EPSG:3857",
        },
        attributions: "Sentinel-Hub",
        serverType: "geoserver",
        crossOrigin: "anonymous",
        projection: getProjection("EPSG:3857"), // Set the projection explicitly
      }),
    });
  }
  function RemoveLayer(Map) {
    Map.getLayers().forEach((element) => {
      if (element.values_.name == "NITROGEN-DIOXIDE") {
        Map.removeLayer(element);
      }
    });
  }
  function updateSearchDropdown(data) {
    const searchDropdown = document.getElementById("search-dropdown");
    // Clear previous content
    searchDropdown.innerHTML = "";
    if (data && Array.isArray(data)) {
      data.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = item.properties.ADMIN;
        listItem.addEventListener("click", (e) => {
          // console.log(item.bbox);
          moveMapToCountry(item.bbox);
          const tileLayer = createCustomTileLayer(item.bbox);
          // tileLayer.setExtent(item.bbox);
          // console.log(tileLayer);
          RemoveLayer(mapRef.current);
          mapRef.current.addLayer(tileLayer);
        });
        searchDropdown.appendChild(listItem);
      });
    }
  }
  return (
    <div className="App">
      <div class="container">
        <label for="start">Image date:</label>
        <input
          type="date"
          id="start"
          name="trip-start"
          min="2018-01-01"
          max=""
          onPointerDown={(e) => {
            const date = new Date();
            let currentDate;
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            1 <= month <= 9
              ? (currentDate = `${year}-0${month}-${day}`)
              : (currentDate = `${year}-${month}-${day}`);
            e.target.setAttribute("value", `${currentDate}`);
            e.target.setAttribute("max", `${currentDate}`);
          }}
          onChange={(e) => {
            let SDate, ToDate;
            const [year, month, day] = e.target.value.split("-");
            SDate = `${year}-${month}-${day}`;
            ToDate = `${year}-${month}-${parseInt(day) + 1}`;
            setFDate(SDate);
            setTDate(ToDate);
          }}
        />
        <div id="search-bar">
          <input
            type="text"
            id="search-input"
            placeholder="Search for a location"
            onInput={(e) => {
              let timeOut;
              let typed = e.target.value;
              // clearTimeout(timeOut);
              timeOut = setTimeout(() => {
                fetchCountryBoundingBox(typed)
                  .then((data) => {
                    // console.log(data);
                    //
                    updateSearchDropdown(data);
                  })
                  .catch((error) => {
                    console.log(error.message);
                  });
              }, 500);
            }}
          />
          <button id="search-button">Search</button>
          <ul id="search-dropdown"></ul>
        </div>
      </div>
      <div id="map" className="map" tabIndex="0"></div>
    </div>
  );
}
////////////////////////////////////////////////////////////////////////
// function App() {
//   const [imageSrc, setImageSrc] = useState("");
//   useEffect(() => {
//     getToken()
//       .then((accessToken) => {
//         return fetch("https://services.sentinel-hub.com/api/v1/process", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${accessToken}`,
//           },
//           body: JSON.stringify({
//             input: {
//               bounds: {
//                 properties: {
//                   crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
//                 },
//                 geometry: {
//                   type: "Polygon",
//                   coordinates: [
//                     [
//                       [-94.04798984527588, 41.7930725281021],
//                       [-94.04803276062012, 41.805773608962869],
//                       [-94.06738758087158, 41.805901566741308],
//                       [-94.06734466552735, 41.7967199475024],
//                       [-94.06223773956299, 41.79144072064381],
//                       [-94.0504789352417, 41.791376727347969],
//                       [-94.05039310455322, 41.7930725281021],
//                       [-94.04798984527588, 41.7930725281021],
//                     ],
//                   ],
//                 },
//               },
//               data: [
//                 {
//                   type: "sentinel-2-l2a",
//                   dataFilter: {
//                     timeRange: {
//                       from: "2018-10-01T00:00:00Z",
//                       to: "2018-12-20T00:00:00Z",
//                     },
//                   },
//                 },
//               ],
//             },
//             output: {
//               width: 512,
//               height: 512,
//               responses: [
//                 {
//                   identifier: "default",
//                   format: {
//                     type: "image/jpeg",
//                     quality: 80,
//                   },
//                 },
//               ],
//             },
//             evalscript: `
//           //VERSION=3

//           function setup() {
//             return {
//               input: [{
//                 bands:["B04", "B08"],
//               }],
//               output: {
//                 id: "default",
//                 bands: 3,
//               }
//             }
//           }

//           function evaluatePixel(sample) {
//               let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04)

//               if (ndvi<-0.5) return [0.05,0.05,0.05]
//               else if (ndvi<-0.2) return [0.75,0.75,0.75]
//               else if (ndvi<-0.1) return [0.86,0.86,0.86]
//               else if (ndvi<0) return [0.92,0.92,0.92]
//               else if (ndvi<0.025) return [1,0.98,0.8]
//               else if (ndvi<0.05) return [0.93,0.91,0.71]
//               else if (ndvi<0.075) return [0.87,0.85,0.61]
//               else if (ndvi<0.1) return [0.8,0.78,0.51]
//               else if (ndvi<0.125) return [0.74,0.72,0.42]
//               else if (ndvi<0.15) return [0.69,0.76,0.38]
//               else if (ndvi<0.175) return [0.64,0.8,0.35]
//               else if (ndvi<0.2) return [0.57,0.75,0.32]
//               else if (ndvi<0.25) return [0.5,0.7,0.28]
//               else if (ndvi<0.3) return [0.44,0.64,0.25]
//               else if (ndvi<0.35) return [0.38,0.59,0.21]
//               else if (ndvi<0.4) return [0.31,0.54,0.18]
//               else if (ndvi<0.45) return [0.25,0.49,0.14]
//               else if (ndvi<0.5) return [0.19,0.43,0.11]
//               else if (ndvi<0.55) return [0.13,0.38,0.07]
//               else if (ndvi<0.6) return [0.06,0.33,0.04]
//               else return [0,0.27,0]
//           }`,
//           }),
//         });
//       })
//       .then((response) => response.blob())
//       .then((blob) => {
//         console.log(blob);
//         const imageURL = URL.createObjectURL(blob);
//         setImageSrc(imageURL);
//       })
//       .catch((error) => {
//         console.error("Error fetching the image:", error);
//       });
//   }, []);
//   //////////////////////////////
//   useEffect(() => {
//     if (imageSrc) {
//       console.log(imageSrc);
//       const tile = new TileWMS();
//       tile.getImage().src = imageSrc;
//       const map = new Map({
//         target: "map",
//         layers: [
//           new TileLayer({
//             source: new OSM(),
//           }),
//           new TileLayer({
//             source: tile,
//           }),
//         ],
//         view: new View({
//           center: [0, 0],
//           zoom: 1,
//         }),
//       });
//     }
//   }, [imageSrc]);

//   return (
//     <div className="App">
//       <a className="skiplink" href="#map">
//         Go to map
//       </a>
//       <div id="map" className="map" tabIndex="0">
//         {imageSrc && <img src={imageSrc} alt="Processed Image" />}
//       </div>
//     </div>
//   );
// }

export default App;
