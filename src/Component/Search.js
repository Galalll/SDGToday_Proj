function fetchCountryBoundingBox(countryName) {
  const url = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson`;

  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const features = data.features;
      const country = features
        .filter((feature) =>
          feature.properties.ADMIN.toLowerCase().includes(
            countryName.toLowerCase()
          )
        )
        .slice(0, 10);
      if (country) {
        // console.log(country);
        return country;
        // console.log("Bounding Box:", bbox);
      } else {
        throw new Error("Country not found.");
      }
    })
    .catch((error) => console.error("Error:", error));
}
/////
export default fetchCountryBoundingBox;
/////
