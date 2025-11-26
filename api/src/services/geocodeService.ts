import axios from 'axios';
import { config } from '@/config/app';
import { logger } from '@/utils/logger';

interface NominatimReverseResponse {
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
    state?: string;
    country?: string;
  };
}

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

export const geocodeService = {
  /**
   * Reverse geocode coordinates to address using OSM Nominatim
   * Usage policy: https://operations.osmfoundation.org/policies/nominatim/
   */
  async reverse(
    latitude: number,
    longitude: number
  ): Promise<{
    address: string;
    city?: string;
    voivodeship?: string;
    postalCode?: string;
  }> {
    try {
      const response = await axios.get<NominatimReverseResponse>(`${config.nominatimUrl}/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1,
          zoom: 18,
        },
        headers: {
          'User-Agent': `Cola-z-Kranu/${config.nominatimEmail}`,
        },
        timeout: 5000,
      });

      const data = response.data;
      const addr = data.address;

      // Extract city name
      const city = addr.city || addr.town || addr.village;

      // Extract voivodeship (state in Poland)
      const voivodeship = addr.state;

      // Build address string
      let addressStr = data.display_name;
      if (addr.road) {
        addressStr = addr.house_number ? `${addr.road} ${addr.house_number}` : addr.road;
        if (city) addressStr += `, ${city}`;
      }

      return {
        address: addressStr,
        city,
        voivodeship,
        postalCode: addr.postcode,
      };
    } catch (error) {
      logger.error('Nominatim reverse geocoding error:', error);

      // Return minimal data on error
      return {
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      };
    }
  },

  /**
   * Search for locations by query
   */
  async search(query: string): Promise<
    Array<{
      lat: number;
      lon: number;
      display_name: string;
    }>
  > {
    try {
      const response = await axios.get<NominatimSearchResult[]>(`${config.nominatimUrl}/search`, {
        params: {
          q: query,
          format: 'jsonv2',
          addressdetails: 1,
          limit: 10,
          countrycodes: 'pl', // Limit to Poland
        },
        headers: {
          'User-Agent': `Cola-z-Kranu/${config.nominatimEmail}`,
        },
        timeout: 5000,
      });

      return response.data.map((item) => ({
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        display_name: item.display_name,
      }));
    } catch (error) {
      logger.error('Nominatim search error:', error);
      return [];
    }
  },
};
