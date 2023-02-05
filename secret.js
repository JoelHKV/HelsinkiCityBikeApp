const API_KEY = "https://maps.googleapis.com/maps/api/js?key=[API_KEY]&callback=initMap"
const script = document.createElement('script');

script.src = API_KEY;
script.async = true;
script.defer = true;
document.head.appendChild(script);