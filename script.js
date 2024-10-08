import "core-js/stable";
import axios from "axios";
import "regenerator-runtime/runtime";

const IPINFO_TOKEN = "eb225a03d2e44c";
const IPIFY_API_KEY = "at_bAboxEsFH3P2YCnwmxg3Ox1zAz8gn";

const asn = document.querySelector(".asn");
const isp = document.querySelector(".isp");
const state = document.querySelector(".state");
const input = document.querySelector(".input");
const ip = document.querySelector(".ip-address");
const country = document.querySelector(".country");
const timezone = document.querySelector(".timezone");
const btn = document.querySelector(".icon-container");

let map;

document.addEventListener("DOMContentLoaded", async () => {
  // Get the user's current position and initialize the map
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      initMap(lat, lng);
    },
    () => alert("Please grant location access")
  );

  try {
    // Get the user Public IpAddress and load his location details
    const { data } = await axios({
      method: "GET",
      url: "https://api.ipify.org?format=json",
    });
    await loadLocationDetail(data.ip);
  } catch (error) {
    console.error("Error getting user's public IP Address", error);
  }
});

const ip_to_coords = function (ip) {
  fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === 404) {
        alert(`${data.error.title}: ${data.error.message}`);
        return;
      }
      const [lat, lng] = data.loc.split(",");
      initMap(parseFloat(lat), parseFloat(lng));
    })
    .catch((err) => {
      console.log("Problems choke");
      console.log(err);
    });
};

function initMap(lat, lng) {
  if (map) {
    map.setView([lat, lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker([lat, lng]).addTo(map);
  } else {
    map = L.map("map").setView([lat, lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker([lat, lng]).addTo(map);
  }
}

async function loadLocationDetail(ipAddress) {
  try {
    const { data } = await axios({
      method: "GET",
      url: `https://geo.ipify.org/api/v2/country?apiKey=${IPIFY_API_KEY}&ipAddress=${ipAddress}`,
    });
    if (data.code === 422) {
      alert(data.messages);
      console.log(data.messages);
    }
    // Set locations details
    ip.textContent = data?.ip;
    state.textContent = data?.location?.region;
    country.textContent = data?.location?.country;
    asn.textContent = data?.as.asn;
    timezone.textContent = data?.location?.timezone;
    isp.textContent = data?.isp;
    ip_to_coords(data?.ip);
  } catch (error) {
    console.error(error);
  }
}

btn.addEventListener("click", function () {
  if (!input.value) return;
  loadLocationDetail(input.value);
});

input.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    if (!input.value) return;
    loadLocationDetail(input.value);
  }
});
