// Google Maps API Callback
function centerMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 30.621312, lng: -96.340094},
    zoom: 17
  });

  infoWindow = new google.maps.InfoWindow;


  var geocoder = new google.maps.Geocoder();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(pos);
      geocoder.geocode({
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      }, function (results, status) {
        if (status === 'OK') {
          $(`#address`).val(results[0].formatted_address);
        }
      });
    }, function () {
      console.log(`Location Retrieval Failed`);
    });
  }
}




$(function () {
  var map;
  function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
     center: {lat: 30.621312, lng: -96.340094},
    zoom: 17
    });
  }


  var locationForm = document.getElementById('location-form');
  locationForm.addEventListener('submit', onSubmit);


  function geocode(e) {
    e.preventDefault();
    var location = document.getElementById('address').value;
    var destination = document.getElementById('destination').value;
    var startLat, startLng, endLat, endLng;

    // Use Axios.js AJAX to get location geocode
    // Welcome to the "promise land"

    // Current location 
    axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: location,
        key: 'AIzaSyDZc26olKXCG0MneliIFp7OY2lj1mbG8ZE'
      }
    }).then(function (locationResponse) {

      //Destination
      axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: destination,
          key: 'AIzaSyDZc26olKXCG0MneliIFp7OY2lj1mbG8ZE'
        }
      }).then(function (destinationResponse) {

        // Coordinates
        startLat = locationResponse
          .data
          .results[0]
          .geometry
          .location
          .lat;

        startLng = locationResponse
          .data
          .results[0]
          .geometry
          .location
          .lng;

        endLat = destinationResponse
          .data
          .results[0]
          .geometry
          .location
          .lat;

        endLng = destinationResponse
          .data
          .results[0]
          .geometry
          .location
          .lng;

        // Use Axios.js AJAX get method for Lyft API call
        axios.get(`https://cors-anywhere.herokuapp.com/https://api.lyft.com/v1/cost?start_lat=${startLat}&start_lng=${startLng}&end_lat=${endLat}&end_lng=${endLng}`)
          .then(function (lyftResponse) {
            var list;

            if (lyftResponse.data.cost_estimates.length === 0) {
              list = list = $(`<ul>`)
                .append($(`<li>`).text(`Lyft can't take you on this trip...`));
              addCard(false, list, 'lyft');
            }
            else {
              var fareMin = lyftResponse.data.cost_estimates[0].estimated_cost_cents_min;
              var fareMax = lyftResponse.data.cost_estimates[0].estimated_cost_cents_max;
              var distance = lyftResponse.data.cost_estimates[0].estimated_distance_miles;
              var timeOfTravel = lyftResponse.data.cost_estimates[0].estimated_duration_seconds;
              list = $(`<ul>`)
                .append($(`<li>`).text(`US $${fareMin / 100} - $${fareMax / 100}`))
                .append($(`<li>`).text(`${distance} miles`))
                .append($(`<li>`).text(`${Math.round(timeOfTravel / 60) ? Math.round(timeOfTravel / 60) : 'Less than zero'} minutes`));
              addCard(true, list, 'lyft');
            }
          })
          .catch(function (error) {
            list = list = $(`<ul>`)
              .append($(`<li>`).text(`Lyft can't take you on this trip...`));
            addCard(false, list, 'lyft');
          });

        // Uber call
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": `https://cors-anywhere.herokuapp.com/https://api.uber.com/v1.2/estimates/price?start_latitude=${startLat}&start_longitude=${startLng}&end_latitude=${endLat}&end_longitude=${endLng}`,
          "method": "GET",
          "headers": {
            "authorization": "Token v-UA8A2to_68Jm6Tpn03GQ0wi52HBB0oA1f1v91a",
            "cache-control": "no-cache",
            "postman-token": "a4c6b084-95d7-d347-a347-1875be72a17b"
          }
        };

        axios(settings)
          .then(function (uberResponse) {
            var list;
            var estimate = uberResponse.data.prices[0].estimate;
            var distance = uberResponse.data.prices[0].distance;
            var timeOfTravel = uberResponse.data.prices[0].duration;
            list = $(`<ul>`)
              .append($(`<li>`).text(estimate))
              .append($(`<li>`).text(`${distance} miles`))
              .append($(`<li>`).text(`${Math.round(timeOfTravel / 60) ? Math.round(timeOfTravel / 60) : 'Less than zero'} minutes`));
            addCard(true, list, 'uber');

          })
          .catch(function (error) {
            list = list = $(`<ul>`)
              .append($(`<li>`).text(`Uber can't take you on this trip...`));
            addCard(false, list, 'uber');
          });
      })
        .catch(function (error) {
          console.log(error)
        });
    });
  }

  // Draw the route on the map
  function drawRoute(e) {
    e.preventDefault();
    initMap();

    var directions = new google.maps.DirectionsService();
    var renderer = new google.maps.DirectionsRenderer();

    var address = document.getElementById('address').value;
    var destination = document.getElementById('destination').value;

    directions.route({
      origin: address,
      destination: destination,
      travelMode: 'DRIVING'
    }, function (result, status) {
      if (status == 'OK') {
        renderer.setMap(map);
        renderer.setDirections(result);
      }
    });
  }

  function onSubmit(e) {
    if (!($(`#input-col`).hasClass(`l4`))) {
      $(`#input-col`).addClass(`l4`);
    }

    var searchBars = $(`#input-col`)
    $(`#main-row`).empty();
    $(`#main-row`).append(searchBars);

    geocode(e);
    drawRoute(e);
  }

  // Lyft Functionality
  function addCard(goodResponse, listData, uberOrLyft) {
    var output = $(`<div>`).addClass(`col s12 m12 l4 card-output`);
    var card;
    if (goodResponse && uberOrLyft === 'lyft') {
      card = $(`<div>`).addClass(`card-panel red lighten-5 card-height`);
    }
    else if (goodResponse && uberOrLyft === 'uber') {
      card = $(`<div>`).addClass(`card-panel grey lighten-1 card-height`);
    }
    else {
      card = $(`<div>`).addClass(`card-panel blue-grey lighten-5`);
    }
    var cardContent = $(`<div>`).addClass(`card-content black-text`);
    var companyLogo = $(`<img>`);
    if (uberOrLyft === 'uber') {
      companyLogo
        .attr(`src`, `./img/uberLogo.png`)
        .attr(`width`, `100`);
    }
    else {
      companyLogo
        .attr(`src`, `./img/Lyft_Logo_Pink.png`)
        .attr(`width`, `100`);
    }
    cardContent.append(companyLogo)
    cardContent.append(listData);
    card.append(cardContent);
    output.append(card);
    $(`#main-row`).append(output);
  }

});

