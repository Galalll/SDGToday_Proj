import axios from "axios";
import qs from "qs";

const getToken = async () => {
  try {
    const response = await axios.post(
      "https://services.sentinel-hub.com/oauth/token",
      qs.stringify({
        grant_type: "client_credentials",
        client_id: "ed0c5b83-ef40-4e62-b134-ca4879dc3ce0",
        client_secret: "MS,h^<Bp&s_dE,}6_)4*r_Cwpeb;t((rH/aQs~JB",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Failed to obtain access token:", error);
    throw error;
  }
};
export default getToken;
// Usage example
