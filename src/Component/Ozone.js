import getToken from "./Auth";
function Ozone() {
  getToken()
    .then((accessToken) => {
      console.log("Access Token:", accessToken);
      return fetch("https://services.sentinel-hub.com/api/v1/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          input: {
            bounds: {
              properties: {
                crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
              },
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [-94.04798984527588, 41.7930725281021],
                    [-94.04803276062012, 41.805773608962869],
                    [-94.06738758087158, 41.805901566741308],
                    [-94.06734466552735, 41.7967199475024],
                    [-94.06223773956299, 41.79144072064381],
                    [-94.0504789352417, 41.791376727347969],
                    [-94.05039310455322, 41.7930725281021],
                    [-94.04798984527588, 41.7930725281021],
                  ],
                ],
              },
            },
            data: [
              {
                type: "sentinel-2-l2a",
                dataFilter: {
                  timeRange: {
                    from: "2018-10-01T00:00:00Z",
                    to: "2018-12-20T00:00:00Z",
                  },
                },
              },
            ],
          },
          output: {
            width: 512,
            height: 512,
            responses: [
              {
                identifier: "default",
                format: {
                  type: "image/jpeg",
                  quality: 80,
                },
              },
            ],
          },
          evalscript: `
          //VERSION=3

          function setup() {
            return {
              input: [{
                bands:["B04", "B08"],
              }],
              output: {
                id: "default",
                bands: 3,
              }
            }
          }
          
          function evaluatePixel(sample) {
              let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04)
          
              if (ndvi<-0.5) return [0.05,0.05,0.05]
              else if (ndvi<-0.2) return [0.75,0.75,0.75]
              else if (ndvi<-0.1) return [0.86,0.86,0.86]
              else if (ndvi<0) return [0.92,0.92,0.92]
              else if (ndvi<0.025) return [1,0.98,0.8]
              else if (ndvi<0.05) return [0.93,0.91,0.71]
              else if (ndvi<0.075) return [0.87,0.85,0.61]
              else if (ndvi<0.1) return [0.8,0.78,0.51]
              else if (ndvi<0.125) return [0.74,0.72,0.42]
              else if (ndvi<0.15) return [0.69,0.76,0.38]
              else if (ndvi<0.175) return [0.64,0.8,0.35]
              else if (ndvi<0.2) return [0.57,0.75,0.32]
              else if (ndvi<0.25) return [0.5,0.7,0.28]
              else if (ndvi<0.3) return [0.44,0.64,0.25]
              else if (ndvi<0.35) return [0.38,0.59,0.21]
              else if (ndvi<0.4) return [0.31,0.54,0.18]
              else if (ndvi<0.45) return [0.25,0.49,0.14]
              else if (ndvi<0.5) return [0.19,0.43,0.11]
              else if (ndvi<0.55) return [0.13,0.38,0.07]
              else if (ndvi<0.6) return [0.06,0.33,0.04]
              else return [0,0.27,0]
          }`,
        }),
      });
    })
    // .then((response) => response.json())
    .then((response) => response.blob())
    .then((blob) => {
      // console.log(blob);
      const imageURL = URL.createObjectURL(blob);
      //   setImageSrc(imageURL);
      return imageURL;
    })
    .catch((error) => {
      console.error("Error fetching the image:", error);
    });
}
export default Ozone;
