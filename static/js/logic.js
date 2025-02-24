// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
//Change street tile layer to the topo layer, to reflect the map in instrutions
let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Create the map object with center and zoom options.
let map =L.map('map',{
  center:[40,-100],
  zoom:5
});

// Then add the 'basemap' tile layer to the map.
basemap.addTo(map);

// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
let earthquake = new L.LayerGroup();
let tectonic_plates = new L.LayerGroup();

let baseMaps = {
  basemap :basemap,
  Topography: topo
  
}

let overlays= {
  'earthquake': earthquake,
  'tectonic_plates':tectonic_plates
}
// Add a control to the map that will allow the user to change which layers are visible.

L.control.layers(baseMaps,overlays,{
  collapsed:true
}).addTo(map);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
     return {
      opacity: 1,
      fillOpacity:1,
      fillColor: getColor(feature.geometry.coordinates[2]),//depth
      color: 'black',
      radius: getRadius(feature.properties.mag),
      stroke:true,
      weight:0.5
     };

  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    return depth >= 90 ? '#900C3F': //? is if ... else statemment
          depth >= 70 ? '#c0392b':
          depth >= 50 ? '#d68910':
          depth >= 30 ? '#f0b27a':
          depth >= 20 ? '#ffe599':
          depth >= 10 ? '#f4ff0d':
          "#53ff0d";
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude === 0 ? 1 :
    magnitude * 4;

  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);

    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      let mg = feature.properties.mag
      let lt = feature.properties.place
      let dh= feature.geometry.coordinates[2]
      layer.bindPopup(`Magnitude: ${mg}<br>Location: ${lt}<br>Depth: ${dh}`)
      

    }
  // OPTIONAL: Step 2
  // Add the data to the earthquake layer instead of directly to the map.
  }).addTo(earthquake);
  earthquake.addTo(map);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialize depth intervals and colors for the legend
    let depths = [-10,10,20,30,50,70,90];

    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (let i=0; i < depths.length; i++){
      div.innerHTML +=
      `<li style='background:${getColor(depths[i])};'></li>`+ depths[i] + `${depths[i+1] ? '&dash;' + depths[i+1] : '+'}<br>`;
    }
    return div;
  };

  // Finally, add the legend to the map.
  legend.addTo(map);


  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
    L.geoJson(plate_data,{
      color: 'orange',
      weight: 2
    }).addTo(tectonic_plates);


    // Then add the tectonic_plates layer to the map.
    tectonic_plates.addTo(map);

  });
});
