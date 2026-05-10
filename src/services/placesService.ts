// ============================================================
// PLACES SERVICE
// Handles Google Places API calls for neighborhood search
// ============================================================

const GOOGLE_PLACES_API_KEY = 'AIzaSyAnlN9keAiIjp5JgzUga_PZoXp4diTayyc';

export interface Neighborhood {
  placeId: string;
  name: string;
  address: string;
  types: string[];
}

// Search for residential communities near a zip code
export const searchNeighborhoods = async (
  zipCode: string,
  query: string
): Promise<Neighborhood[]> => {
  try {
    // First get coordinates from zip code
    const geoResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${GOOGLE_PLACES_API_KEY}`
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      return [];
    }

    const { lat, lng } = geoData.results[0].geometry.location;

    // Search for residential communities
    const searchQuery = query.length > 0
      ? query
      : 'apartment complex OR housing community OR residential OR dormitory OR campus';

    const placesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=${lat},${lng}&radius=5000&key=${GOOGLE_PLACES_API_KEY}`
    );
    const placesData = await placesResponse.json();

    if (!placesData.results) return [];

    // Filter for residential places
    const residentialTypes = [
      'apartment_complex',
      'university',
      'school',
      'lodging',
      'establishment',
      'point_of_interest',
    ];

    return placesData.results
      .filter((place: any) => {
        const name = place.name.toLowerCase();
        // Filter for residential keywords
        const isResidential =
          name.includes('apartment') ||
          name.includes('village') ||
          name.includes('community') ||
          name.includes('residence') ||
          name.includes('dorm') ||
          name.includes('housing') ||
          name.includes('court') ||
          name.includes('place') ||
          name.includes('park') ||
          name.includes('manor') ||
          name.includes('estate') ||
          name.includes('grove') ||
          name.includes('crossing') ||
          name.includes('landing') ||
          name.includes('pointe') ||
          name.includes('commons') ||
          name.includes('university') ||
          name.includes('college') ||
          name.includes('campus') ||
          name.includes('hall') ||
          name.includes('suites') ||
          name.includes('town') ||
          name.includes('square') ||
          name.includes('heights') ||
          name.includes('creek') ||
          name.includes('ridge') ||
          name.includes('meadow') ||
          name.includes('lake') ||
          name.includes('garden') ||
          name.includes('trail') ||
          // Also include if query matches name
          (query.length > 2 && name.includes(query.toLowerCase()));
        return isResidential;
      })
      .slice(0, 10)
      .map((place: any) => ({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        types: place.types,
      }));
  } catch (error) {
    console.error('Places API error:', error);
    return [];
  }
};