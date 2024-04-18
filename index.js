if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./s.js").then(registration => {
    console.log("Service Worker registered with scope:", registration.scope);
  }).catch(error => {
    console.log("Service Worker registration failed:", error);
  });
} else {
  console.log("Service Worker is not supported by this browser.");
}

// Check if Geolocation API is supported
if ('geolocation' in navigator) {
  // Define geofences
  const geofences = [
      {
          center: { latitude: 28.610254, longitude: -81.430840 }, // Orlando, FL
          radius: 300 // 300 meters 
      },
      {
          center: { latitude: 29.196925,  longitude: -82.140385 }, // Brothers, FL
          radius: 300 // 300 meters 
      },
      {
          center: { latitude: 28.600453, longitude: -82.122522 }, // Ocala, FL
          radius: 300 // 300 meters
      },
      {
          center: { latitude: 25.761680, longitude: -81.436783 }, // Rosemont, FL
          radius: 300 // 300 meters
      }
      // Add more geofences as needed
       
       
  ];

  // Request location permission
  navigator.geolocation.getCurrentPosition(
      // Success callback
      function(position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          document.getElementById('status').innerHTML = `Current location: ${latitude}, ${longitude}`;

          // Monitor geofence events for each geofence
          geofences.forEach(geofence => {
              navigator.geolocation.watchPosition(
                  // Success callback
                  function(position) {
                      const userLocation = {
                          latitude: position.coords.latitude,
                          longitude: position.coords.longitude
                      };
                      const distance = calculateDistance(userLocation, geofence.center);
                      if (distance <= geofence.radius) {
                          // User is within geofence, send a notification
                          sendNotification(`You are within the geofence of ${geofence.center.latitude}, ${geofence.center.longitude}`);
                      }
                  },
                  // Error callback
                  function(error) {
                      console.error('Error getting user location:', error);
                  }
              );
          });
      },
      // Error callback
      function(error) {
          console.error('Error getting user location:', error);
          document.getElementById('status').innerHTML = 'Failed to get location.';
      }
  );
} else {
  console.error('Geolocation is not supported by this browser.');
  document.getElementById('status').innerHTML = 'Geolocation is not supported.';
}

// Function to send a notification
function sendNotification(message) {
  // Check if notifications are supported by the browser
  if ('Notification' in window) {
      // Check if permission has been granted previously
      if (Notification.permission === 'granted') {
          // Create and display a notification
          var notification = new Notification('Geofence Alert', {
              body: message
          });
          
          // Handle notification click event if needed
          notification.onclick = function() {
              // Handle notification click action
              console.log('Notification clicked');
          };
      } else {
          // Permission not granted or denied, handle accordingly
          console.log('Permission not granted for notifications');
      }
  } else {
      // Notifications not supported by the browser, handle accordingly
      console.log('Notifications not supported by this browser');
  }
}

// Function to calculate distance between two points (Haversine formula)
function calculateDistance(point1, point2) {
  const earthRadius = 6371000; // Earth's radius in meters
  const lat1 = deg2rad(point1.latitude);
  const lat2 = deg2rad(point2.latitude);
  const deltaLat = deg2rad(point2.latitude - point1.latitude);
  const deltaLon = deg2rad(point2.longitude - point1.longitude);

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = earthRadius * c;

  return distance;
}

// Function to convert degrees to radians
function deg2rad(degrees) {
  return degrees * (Math.PI/180);
}
