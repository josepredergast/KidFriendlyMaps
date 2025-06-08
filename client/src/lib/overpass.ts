import type { OverpassResponse, Place, PlaceType, OverpassElement } from '@shared/types';

// Hudson County, NJ bounds
export const HUDSON_COUNTY_BOUNDS = {
  north: 40.7834,
  south: 40.6983,
  east: -74.0160,
  west: -74.0833
};

export const ACTIVITY_CONFIGS = {
  playground: {
    label: 'Playgrounds',
    description: 'Outdoor play areas',
    color: 'hsl(0, 0%, 100%)', // White
    icon: '🛝',
    query: 'leisure=playground'
  },
  park: {
    label: 'Parks',
    description: 'Green spaces & recreation',
    color: 'hsl(120, 70%, 35%)', // Forest green
    icon: '🌳',
    query: 'leisure=park'
  },
  museum: {
    label: 'Museums',
    description: 'Educational exhibitions',
    color: 'hsl(45, 100%, 50%)', // Bright yellow
    icon: '🏛️',
    query: 'tourism=museum'
  },
  gallery: {
    label: 'Galleries',
    description: 'Art & cultural spaces',
    color: 'hsl(320, 80%, 45%)', // Magenta
    icon: '🖼️',
    query: 'tourism=gallery'
  },
  science: {
    label: 'Science Centers',
    description: 'Interactive learning',
    color: 'hsl(15, 85%, 55%)', // Orange-red
    icon: '🔬',
    query: 'amenity=science_center'
  },
  planetarium: {
    label: 'Planetariums',
    description: 'Space & astronomy',
    color: 'hsl(280, 70%, 50%)', // Purple
    icon: '🌟',
    query: 'amenity=planetarium'
  }
} as const;

export async function fetchPlacesFromOverpass(): Promise<Place[]> {
  const bounds = HUDSON_COUNTY_BOUNDS;
  
  const overpassQuery = `
    [bbox:${bounds.south},${bounds.west},${bounds.north},${bounds.east}]
    [out:json]
    [timeout:90]
    ;
    (
      node["leisure"="playground"];
      way["leisure"="playground"];
      relation["leisure"="playground"];
      
      node["leisure"="park"];
      way["leisure"="park"];
      relation["leisure"="park"];
      
      node["tourism"="museum"];
      way["tourism"="museum"];
      relation["tourism"="museum"];
      
      node["tourism"="gallery"];
      way["tourism"="gallery"];
      relation["tourism"="gallery"];
      
      node["amenity"="science_center"];
      way["amenity"="science_center"];
      relation["amenity"="science_center"];
      
      node["amenity"="planetarium"];
      way["amenity"="planetarium"];
      relation["amenity"="planetarium"];
    );
    out center meta;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'data=' + encodeURIComponent(overpassQuery)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: OverpassResponse = await response.json();
  return processPlacesData(data.elements);
}

function processPlacesData(elements: OverpassElement[]): Place[] {
  return elements
    .map(element => {
      const lat = element.lat || (element.center && element.center.lat);
      const lon = element.lon || (element.center && element.center.lon);
      
      if (!lat || !lon) return null;

      const tags = element.tags || {};
      let type: PlaceType = 'playground'; // default fallback
      
      // Determine place type based on tags
      if (tags.leisure === 'playground') type = 'playground';
      else if (tags.leisure === 'park') type = 'park';
      else if (tags.tourism === 'museum') type = 'museum';
      else if (tags.tourism === 'gallery') type = 'gallery';
      else if (tags.amenity === 'science_center') type = 'science';
      else if (tags.amenity === 'planetarium') type = 'planetarium';
      else return null; // Skip if we can't determine type

      return {
        id: element.id,
        type,
        name: tags.name || `Unnamed ${ACTIVITY_CONFIGS[type].label.slice(0, -1)}`,
        lat,
        lon,
        address: buildAddress(tags),
        website: tags.website || '',
        phone: tags.phone || '',
        description: tags.description || '',
        tags
      };
    })
    .filter((place): place is Place => place !== null);
}

function buildAddress(tags: Record<string, string>): string {
  const addressParts = [];
  
  if (tags['addr:housenumber']) addressParts.push(tags['addr:housenumber']);
  if (tags['addr:street']) addressParts.push(tags['addr:street']);
  if (tags['addr:city']) addressParts.push(tags['addr:city']);
  if (tags['addr:postcode']) addressParts.push(tags['addr:postcode']);
  
  return addressParts.join(' ') || tags['addr:full'] || '';
}
