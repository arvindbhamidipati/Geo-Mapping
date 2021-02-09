var map_background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoibWFudWVsYW1hY2hhZG8iLCJhIjoiY2ppczQ0NzBtMWNydTNrdDl6Z2JhdzZidSJ9.BFD3qzgAC2kMoEZirGaDjA");

// map object to an array of layers we created.
var map = L.map("mapid", {
  center: [0, 0],
  zoom: 5,
  layers: [map_background]
});


// layers for two different sets of data, earthquakes and tectonicplates.
var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// base layers
var baseMaps = {
  regular_map: map_background
};

var pointsMap = {
  "Tectonic Plates": tectonicplates,
  "Earthquakes": earthquakes
};

L
  .control
  .layers(baseMaps, pointsMap)
  .addTo(map);

// retrieve earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson", function(data) {

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }

  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: bubbleColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Define the color of the marker based on the magnitude of the earthquake.
  function bubbleColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "#8B0000";
      case magnitude > 4:
        return "#FF0000";
      case magnitude > 3:
        return "#ffa500";
      case magnitude > 2:
        return "#fed8b1";
      case magnitude > 1:
        return "#ffff00";
      default:
        return "#98ee00";
    }
  }
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(earthquakes);

  earthquakes.addTo(map);

  var legend = L.control({
    position: "bottomright"
  });
  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var magnitudeRatings = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#98ee00",
      "#8B0000",
      "#FF0000",
      "#ffa500",
      "#fed8b1",
      "#ffff00"
    ];


    for (var i = 0; i < magnitudeRatings.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        magnitudeRatings[i] + (magnitudeRatings[i + 1] ? " to " + magnitudeRatings[i + 1] + "<br>" : "+");
    }
    return div;
  };


  legend.addTo(map);

  // retrive Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {

      L.geoJson(platedata, {

        weight: 1,
        color: "black"

      })
      .addTo(tectonicplates);

      // add the tectonicplates layer to the map.
      tectonicplates.addTo(map);
    });
});
