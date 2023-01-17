
let map;
let addressCounter = 0;
let apiKey = 'AIzaSyCY5Ko2G-pybtFUctOe-FH0uWc7u-NcYr0';
let lat;
let lng;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 17,
      center: new google.maps.LatLng(44.8065219,-0.607979),
      mapTypeId: "terrain",
    });
}

function displayMap(lat, lng) {
    map = new google.maps.Map(document.getElementById("map"), {
        center: new google.maps.LatLng(lat, lng),
        zoom: 10,
    })
    let marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map,
        animation: google.maps.Animation.DROP,
        label: "buddycenter",
    })

    marker.addListener("click", toggleBounce);

    function toggleBounce() {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }
    return map;
}


function addAddressField() {
    // Incrémenter le compteur d'adresses
    addressCounter++;

    // Créer un nouveau champ de saisie pour l'adresse
    let newAddressField = document.createElement("input");
    newAddressField.setAttribute("class", "input-group-text");
    newAddressField.setAttribute("type", "text");
    newAddressField.setAttribute("id", "address" + addressCounter);
    newAddressField.setAttribute("name", "address" + addressCounter);
    newAddressField.setAttribute("style", "margin: auto;");
    newAddressField.style.width = "40%";

    let removeButton = document.createElement("button");
    removeButton.setAttribute("id", "remove" + addressCounter);
    removeButton.setAttribute("class", "btn btn-primary");;
    removeButton.textContent = "remove";
    removeButton.setAttribute("value", "remove");
    removeButton.setAttribute("type", "button");

    // Ajouter le champ de saisie et son étiquette à la page
    let addressForm = document.getElementById("address-form");
    addressForm.appendChild(newAddressField);
    addressForm.appendChild(removeButton);
    addressForm.appendChild(document.createElement("br"));

    removeButton.addEventListener('click', () => {
        newAddressField.remove();
        removeButton.remove();

    });

    // Create the autocomplete object, restricting the search predictions to
    let autocomplete = new google.maps.places.Autocomplete(newAddressField, {
        fields: ["address_components", "geometry"],
        types: ["address"],
    })
}

async function fetchUrl(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            redirect: 'follow',
        });
        const exam = await response.json();

        if (response.status == 200) {
            return exam;
        }
        else {
            alert("Bad request: " + response.status);
            return;
        }
    } catch (error) {
        console.error(error);
    }
}

async function calculatePoint(address) {
    if (address === "") {
        alert("empty addres")
        return;
    }
    let url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(address) + '&key=' + apiKey;
    // Envoyer une requête HTTP GET à l'API pour chaque adresse
    let response = await fetchUrl(url);
    console.log(response)
    console.log("response: " + JSON.stringify(response))

    if (response.results.length > 0) {
        lat = response.results[0].geometry.location.lat;
        lng = response.results[0].geometry.location.lng;
        console.log("lat func: " + lat)

        return [lat, lng];
    }
    else {
        alert("No valid answer")
        return;
    }
}

async function calculateItin(origin, destination, map) {
    let directionsService = new google.maps.DirectionsService();
    let directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    let request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode["DRIVING"]
    }
    directionsService.route(request, function (response, status) {
        directionsRenderer.setDirections(response);
    })
}

async function getPlaces(lat_buddy, lng_buddy, map) {
    let request = {
        location: { lat: lat_buddy, lng: lng_buddy },
        radius: '10000',
        type: ['cinema', 'restaurant', 'bar', 'pub']
    };
    let service = new google.maps.places.PlacesService(map);
    let response = service.nearbySearch(request, callback_places);
    return response
}

async function callback_places(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (let i = 0; i < 5; i++) {
            console.log(results[i].data);

        }
    }
}

async function calculateMidpoint() {
    // Récupérer tous les champs de saisie d'adresse
    let addressFields = document.querySelectorAll("input[name^='address']");
    // Créer un tableau pour stocker les adresses
    let addresses = [];

    // Ajouter les adresses saisies dans le tableau
    addressFields.forEach(function (addressField) {
        if (addressField.value) {
            addresses.push(addressField.value);
        }
    });
    // Vérifie si il y a des adresses
    if (addresses.length < 2) {
        alert("Veuillez saisir au moins 2 adresses.");
        return;
    }
    let lat_total = 0.0;
    let lng_total = 0.0;
    for (let i = 0; i < addressFields.length; i++) {
        var address = addressFields[i].value;
        var coord = await calculatePoint(address);
        console.log("coord[0] " + coord[0])

        lat_total = parseFloat(coord[0]) + lat_total;
        lng_total = parseFloat(coord[1]) + lng_total;
        console.log("lat: " + lat_total)
        console.log("lng: " + lng_total)

        marker = new google.maps.Marker({
            position: { lat: coord[0], lng: coord[1] },
            map,
            animation: google.maps.Animation.DROP,
            label: address,
        })

    }
    let lat_buddy = lat_total / addressFields.length;
    let lng_buddy = lng_total / addressFields.length;

    // Afficher les coordonnées GPS moyennes à l'utilisateur
    let url3 = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat_buddy + ',' + lng_buddy + '&key=' + apiKey;
    let response = await fetchUrl(url3);
    let address_buddy = response.results[0].formatted_address
    document.getElementById('output').innerHTML = "<br><h2><span class=\"label label-primary\">Adress: " + address_buddy + "</span></h2><br>";

    displayMap(lat_buddy, lng_buddy);
    calculatePoint(address_buddy);

    for (let i = 0; i < addressFields.length; i++) {
        calculateItin(address_buddy, addressFields[i].value, map);
    }
    //results = getPlaces(lat_buddy, lng_buddy, map);
}

function initialize() {
  addAddressField();
  addAddressField();
  initMap();
}