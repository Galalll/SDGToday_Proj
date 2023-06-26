import React, { useState, useEffect } from "react";
import axios from "axios";

function Countries() {
  const [countries, setCountries] = useState([]);
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        if (response.status === 200) {
          setCountries(response.data);
          // console.log(response.data);
        } else {
          throw new Error("Failed to retrieve countries");
        }
      } catch (error) {
        console.error("Error:", error.message);
      }
    };
    fetchCountries();
  }, []);

  return <></>;
}

export default Countries;
