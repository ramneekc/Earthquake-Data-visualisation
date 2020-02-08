var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

d3.json(url, function(response){

  d3.json("PB2002_plates.geojson", function(data){
    var t_plates = L.geoJson(data, {
      style: function(x) {
        return {
          color: "orange",
          fillColor:"",
          fillOpacity:0,
          weight: 5
        };
      }
    });
    var features = response.features;
    createFeatures(features, t_plates) 
  });

});

function getColor(m){
  return m > 5 ? "red" :
         m > 4 ? "orange":
         m > 3 ? "blue":
         m > 2 ? "yellow":
         m > 1 ? "purple":
                 "green"; 
}

var e_markers = [];

function createFeatures(features, t_plates){
  
  for (var i = 0; i < features.length; i++){
      var magnitude = features[i].properties.mag;
      var coord = features[i].geometry.coordinates;
      var markers = [coord[1],coord[0]];

      var circle = L.circle(markers, {
        fillOpacity: 0.75,
        color: getColor(magnitude),
        fillColor: getColor(magnitude),
        radius: magnitude * 9000
      })
      .bindPopup("<h1>" + features[i].properties.title);
      
      e_markers.push(circle);
      
  }

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function(myMap){
    var div = L.DomUtil.create("div", "info legend"),
        grades = [0,1,2,3,4,5],
        colors = ["green","purple","yellow","blue","orange","red"],
        labels = [];
        for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background-color:' + colors[i] + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    return div;
    };
  createMap(e_markers, t_plates, legend);
   
}

function createMap(e_markers, t_plates, legend){
  
  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });
  
  var dark = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });
  
  var pencil = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.pencil",
    accessToken: API_KEY
  });
  
  var baseMaps = {
    Satellite: satellite,
    Dark: dark,
    Pencil: pencil
  };
  
  var markerGroup = L.layerGroup(e_markers);
  var overlayMaps = {
    "Earthquake": markerGroup
  };
  
  var myMap = L.map("map", {
    center: [39.09, -100.57],
    zoom: 5,
    layers: [satellite, markerGroup, t_plates]
  });
  legend.addTo(myMap);
 
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
}