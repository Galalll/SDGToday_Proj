import getToken from "./Auth";

function SentApi() {
  const accessToken = getToken().then((data) => {
    const response = fetch(
      "https://services.sentinel-hub.com/api/v1/statistics",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${data}`,
        },
        body: JSON.stringify({
          input: {
            bounds: {
              bbox: [400000, 5000000, 402500, 5002500],
              properties: {
                crs: "http://www.opengis.net/def/crs/EPSG/0/32633",
              },
            },
            data: [
              {
                type: "sentinel-5p-l2",
                dataFilter: {
                  mosaickingOrder: "leastRecent",
                },
              },
            ],
          },
          aggregation: {
            timeRange: {
              from: "2020-06-01T00:00:00Z",
              to: "2020-07-31T00:00:00Z",
            },
            aggregationInterval: {
              of: "P10D",
            },
            evalscript: `
    //VERSION=3

    function setup() {
      return {
        input: ["NO2","dataMask"],
        output: [
          {
            id: "output_NO2",
            bands: 1,
            sampleType: "FLOAT32"
          },
          {
            id: "dataMask",
            bands: 1
          }
          ]
      }
    }
    function evaluatePixel(samples) {
      return {
        output_NO2: [samples.NO2],
        dataMask: [samples.dataMask],
      };
    }`,
            resx: 10,
            resy: 10,
          },
        }),
      }
    )
      .then((response) => response.json())
      .then((sh_statistics) => {
        // console.log(sh_statistics);
        // Process the response data
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
}
export default SentApi;
