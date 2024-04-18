// Check if Geolocation API is supported
if ('geolocation' in navigator) {
  // Request location permission
  navigator.geolocation.getCurrentPosition(
      // Success callback
      function(position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          document.getElementById('status').innerHTML = `Current location: ${latitude}, ${longitude}`;

          // Define geofence parameters (e.g., latitude, longitude, radius)
          const geofence = {
              center: { latitude: 28.610254, longitude: -81.430840 }, // Orlando, FL
              radius: 100 // 20 meters 
          };

          // Monitor geofence events
          navigator.geolocation.watchPosition(
              // Success callback
              function(position) {
                  const userLocation = {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude
                  };
                  const distance = calculateDistance(userLocation, geofence.center);
                  if (distance <= geofence.radius) {
                      // User is within geofence
                      alert('You are within the geofence!');
                  }
              },
              // Error callback
              function(error) {
                  console.error('Error getting user location:', error);
              }
          );
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
