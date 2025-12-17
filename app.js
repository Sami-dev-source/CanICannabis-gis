// =======================
// Base map
// =======================

const map = L.map('map').setView([49.0069, 8.4037], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Layers
let redLayer;
let blueLayer;

// =======================
// Load red / blue zones
// =======================

async function loadRed() {
  const res = await fetch('http://127.0.0.1:8000/zones/red');
  const geojson = await res.json();
  console.log('red features:', geojson.features.length);

  redLayer = L.geoJSON(geojson, {
    style: { color: 'red', weight: 1, fillOpacity: 0.4 },
    onEachFeature: (feature, layer) => {
      const props = feature.properties || {};
      layer.bindPopup(`Restriction: ${props.restriction || ''}`);
    }
  }).addTo(map);

  map.fitBounds(redLayer.getBounds());
}

async function loadBlue() {
  const res = await fetch('http://127.0.0.1:8000/zones/blue');
  const geojson = await res.json();
  console.log('blue features:', geojson.features.length);

  blueLayer = L.geoJSON(geojson, {
    style: { color: 'blue', weight: 1, fillOpacity: 0.4 },
    onEachFeature: (feature, layer) => {
      const props = feature.properties || {};
      layer.bindPopup(`Restriction: ${props.restriction || ''}`);
    }
  }).addTo(map);
}

// =======================
// Buttons
// =======================

// Red zones: always on, load once at start
loadRed();

// Optional: if you still have a red button, disable it
const redBtn = document.getElementById('loadRed');
if (redBtn) {
  redBtn.disabled = true;
  redBtn.textContent = 'Red zones (always on)';
}

// Blue zones: toggle on/off
const blueBtn = document.getElementById('loadBlue');

blueBtn.addEventListener('click', async () => {
  if (!blueLayer) {
    await loadBlue();
    blueBtn.textContent = 'Hide blue zones';
  } else {
    map.removeLayer(blueLayer);
    blueLayer = null;
    blueBtn.textContent = 'Show blue zones';
  }
});

// =======================
// Search (Nominatim)
// =======================

// Marker for searched location
let userMarker = null;

async function searchAddress() {
  const q = document.getElementById('searchInput').value;
  if (!q) return;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${
    encodeURIComponent(q + ', Karlsruhe, Germany')
  }`;

  const res = await fetch(url);
  const data = await res.json();
  if (!data.length) {
    alert('Address not found');
    return;
  }

  const lat = parseFloat(data[0].lat);
  const lon = parseFloat(data[0].lon);

  if (userMarker) {
    map.removeLayer(userMarker);
  }
  userMarker = L.marker([lat, lon]).addTo(map);
  map.setView([lat, lon], 17);
}

document.getElementById('searchBtn').addEventListener('click', searchAddress);

