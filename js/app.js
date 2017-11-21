var defaultLocations = [{
        title: 'Sud Italia Ristorante',
        location: {
            lat: 29.714880,
            lng: -95.414738
        }
    },
    {
        title: "Torchy's Tacos",
        location: {
            lat: 29.716962,
            lng: -95.415130
        }
    },
    {
        title: 'Oh My Gogi',
        location: {
            lat: 29.716233,
            lng: -95.414614
        }
    },
    {
        title: 'Hopdoddy Burger Bar',
        location: {
            lat: 29.716165,
            lng: -95.415334
        }
    },
    {
        title: 'CoCo Crêpes, Waffles & Coffee',
        location: {
            lat: 29.714723,
            lng: -95.414373
        }
    },
    {
        title: 'Shiva Indian Restaurant',
        location: {
            lat: 29.716912,
            lng: -95.417313
        }
    }
];

var map;
var currWindow = false;

var loc = function(places) {
    var self = this;
    this.visible = ko.observable(true);
    this.name = ko.observable(places.title);
    this.location = ko.observable(places.location);
    var placeURL = "";
    var formattedAddress = "";
    var phone = "";
    // An AJAX call to the Foursquare API to fetch the required data and information about the place by passing its lat lng coordinates.
    $.ajax({
        url: 'https://api.foursquare.com/v2/venues/search',
        dataType: 'json',
        data: 'limit=1' +
            '&ll=' + this.location().lat + ',' + this.location().lng +
            '&client_id=' + 'XCRIFOG2UD1XBKDFJSUJHIBWNZYXUDTKGR2WFR0UGWF5FSAC' +
            '&client_secret=' + 'RDV4DTORORD0USLQY2ECGS4GFYUREN4XYLJPUEUQA3DGY2CJ' +
            '&query=' + this.name() +
            '&v=20180806',
        async: true,
        success: function(data) {
            var reqResponse = data.response.venues[0];
            if (typeof reqResponse.location.formattedAddress[2] === 'undefined') {
                reqResponse.location.formattedAddress[2] = "";
            }
            formattedAddress = reqResponse.location.formattedAddress[0] + ', ' + reqResponse.location.formattedAddress[1] + ', ' + reqResponse.location.formattedAddress[2];
            if (typeof reqResponse.contact.formattedPhone === 'undefined') {
                reqResponse.contact.formattedPhone = "No Phone number available.";
            }
            phone = reqResponse.contact.formattedPhone;
            if (typeof reqResponse.url === 'undefined') {
                reqResponse.url = "# No website available. #";
            }
            placeURL = reqResponse.url;
        },
        error: function(err) {
            alert("Foursquare data is unavailable. Please try refreshing");
        }
    });
    var infowindow = new google.maps.InfoWindow({
      maxWidth: 350
    });
    var clickedIcon = makeMarkerIcon('00ff6e');
    var defaultIcon = makeMarkerIcon('0091ff');
    var highlightedIcon = makeMarkerIcon('FFFF24');
    // Google Map markers (all markers al placed on the map initially.)
    var marker = new google.maps.Marker({
        position: this.location(),
        title: this.name(),
        map: map,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon

    });
    //Filters through the markers and only shows the required markers.
    this.showMarker = ko.computed(function() {
        if (this.visible() === true) {
            marker.setMap(map);
        } else {
            marker.setMap(null);
        }
        return true;
    }, this);

    //Stop Animation of the marker after a set time.
    function stopAnimation(mark) {
        setTimeout(function() {
            mark.setAnimation(null);
            mark.setIcon(defaultIcon);
        }, 2500);
    }
    //Display information about any one selected marker (place).
    google.maps.event.addListener(marker, 'click', function() {
        if (currWindow) {
            currWindow.close();
            this.setIcon(defaultIcon);
        }
        currWindow = infowindow;
        this.setIcon(clickedIcon);
        this.setAnimation(google.maps.Animation.BOUNCE);
        stopAnimation(this);
        infowindow.addListener('closeclick', function() {
            marker.setIcon(defaultIcon);
        });
        infowindow.setContent('<div id = "iw-container">'+
            '<div class="iw-content">' +
            '<div class="iw-title" style="text-align:center">' + marker.title + '</div>' +
            '<div class="infowindow-address iw-subTitle">' + formattedAddress + '</div>' +
            '<div class="infowindow-phone"><h4>Phone No: ' + phone + '</h4></div>' +
            '<div class="infowindow-url"><h4>Website: <a href=' + placeURL + '>' + placeURL + '</a></h4></div>'+
            '</div>'+
            '<div class="iw-bottom-gradient"></div>'+
            '</div>');
        infowindow.open(map, this);

    });

    marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
    });
    this.animate = function(place) {
        google.maps.event.trigger(marker, 'click');
        map.setCenter(this.location());
    };
    google.maps.event.addListener(map, 'click', function() {
      infowindow.close();
    });
    // Marker visuals adjusted to make it aesthetically pleasing.
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }
    // *
    // CODE REFERENCE: This code is from codepen "5 ways to customize the Google Maps infowindow - A PEN BY Miguel Marnoto"
    // START INFOWINDOW CUSTOMIZE.
    // The google.maps.event.addListener() event expects
    // the creation of the infowindow HTML structure 'domready'
    // and before the opening of the infowindow, defined styles are applied.
    // *
    google.maps.event.addListener(infowindow, 'domready', function() {

      // Reference to the DIV that wraps the bottom of infowindow
      var iwOuter = $('.gm-style-iw');

      /* Since this div is in a position prior to .gm-div style-iw.
       * We use jQuery and create a iwBackground variable,
       * and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
      */
      var iwBackground = iwOuter.prev();

      // Removes background shadow DIV
      iwBackground.children(':nth-child(2)').css({'display' : 'none'});

      // Removes white background DIV
      iwBackground.children(':nth-child(4)').css({'display' : 'none'});

      // Moves the infowindow 1px to the right.
      iwOuter.parent().parent().css({left: '1px'});

      // Changes the desired tail shadow color.
      iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index' : '1'});

      // Reference to the div that groups the close button elements.
      var iwCloseBtn = iwOuter.next();

      // Apply the desired effect to the close button
      iwCloseBtn.css({opacity: '1', right: '38px', top: '3px', border: '7px solid #48b5e9', 'border-radius': '13px', 'box-shadow': '0 0 5px #3990B9'});

      // If the content of infowindow not exceed the set maximum height, then the gradient is removed.
      if($('.iw-content').height() < 140){
        $('.iw-bottom-gradient').css({display: 'none'});
      }

      // The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
      iwCloseBtn.mouseout(function(){
        $(this).css({opacity: '1'});
      });
    });
  };

function viewModel() {
    var self = this;
    this.searchPlace = ko.observable("");
    this.listLocations = ko.observableArray([]);
    // Create a new map with a specific center and zoom levels.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 29.716165,
            lng: -95.415334
        },
        zoom: 17

    });
    defaultLocations.forEach(function(locationItem) {
        self.listLocations.push(new loc(locationItem));
    });
    // Reset the map to the original values when the reset button is clicked.
    this.resetMap = function() {
        map.setCenter({
            lat: 29.716165,
            lng: -95.415334
        });
        map.setZoom(17);
        if (currWindow) {
            currWindow.close();
        }
    };
    // Takes in the value that the user typed in the input search box and only displays the list items that match the search input text value.
    this.filtered = ko.computed(function() {
        var Place = self.searchPlace().toLowerCase();
        if (!Place) {
            self.listLocations().forEach(function(locationItem) {
                locationItem.visible(true);
            });
            return self.listLocations();
        } else {
            return ko.utils.arrayFilter(self.listLocations(), function(item) {
                var filteredPlace = (item.name().toLowerCase().search(Place) >= 0);
                item.visible(filteredPlace);
                return filteredPlace;
            });
        }
    }, self);
}

function initApp() {
    ko.applyBindings(new viewModel());
}

function errorHandler() {
    alert("Google Maps is unavailable. Please try reloading the page.");
}
