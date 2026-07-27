// Map rendering script supporting free OpenStreetMap (Leaflet) & Mapbox fallback
document.addEventListener("DOMContentLoaded", () => {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  // Extract coordinates [longitude, latitude] from listing.geometry
  let lng = 77.2090;
  let lat = 28.6139;

  if (
    typeof listing !== "undefined" &&
    listing &&
    listing.geometry &&
    Array.isArray(listing.geometry.coordinates) &&
    listing.geometry.coordinates.length === 2
  ) {
    const [gLng, gLat] = listing.geometry.coordinates;
    if (!isNaN(gLat) && !isNaN(gLng) && (gLat !== 0 || gLng !== 0)) {
      lng = gLng;
      lat = gLat;
    }
  }

  const title = (typeof listing !== "undefined" && listing && listing.title) ? listing.title : "Listing Location";
  const locationName = (typeof listing !== "undefined" && listing && listing.location) ? listing.location : "";

  // If Mapbox token is present and valid, try Mapbox GL JS, otherwise fallback to free OpenStreetMap (Leaflet)
  if (typeof mapToken !== "undefined" && mapToken && mapToken.startsWith("pk.")) {
    try {
      mapboxgl.accessToken = mapToken;
      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v12",
        center: [lng, lat],
        zoom: 9,
      });

      new mapboxgl.Marker({ color: "red" })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="map-click">
              <h4><b>${title}</b></h4> 
              <p>Exact location will be provided after booking.</p>
            </div>`
          )
        )
        .addTo(map);

      map.addControl(new mapboxgl.ScaleControl());
      map.addControl(new mapboxgl.NavigationControl());
      return;
    } catch (e) {
      console.warn("Mapbox initialization failed, falling back to Leaflet OpenStreetMap:", e);
    }
  }

  // Free OpenStreetMap (Leaflet) setup
  if (typeof L !== "undefined") {
    // Leaflet uses [latitude, longitude]
    const map = L.map("map").setView([lat, lng], 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const marker = L.marker([lat, lng]).addTo(map);
    marker
      .bindPopup(
        `<div class="map-click">
          <h4><b>${title}</b></h4> 
          <p>${locationName ? locationName + '<br>' : ''}Exact location will be provided after booking.</p>
        </div>`
      )
      .openPopup();
  }
});
