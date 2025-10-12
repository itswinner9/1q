// Default placeholder images for neighborhoods and buildings
// Using Unsplash royalty-free images

export const neighborhoodImages = [
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop', // Urban street
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop', // City neighborhood
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop', // Modern buildings
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop', // City skyline
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop', // Residential area
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop', // Neighborhood street
]

export const buildingImages = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop', // Apartment building
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop', // Modern condo
  'https://images.unsplash.com/photo-1565402170291-8491f14678db?w=800&h=600&fit=crop', // High-rise
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop', // Residential building
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop', // Apartment exterior
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=600&fit=crop', // Building facade
]

export function getNeighborhoodImage(neighborhoodName: string, index: number = 0): string {
  // Use neighborhood name to get consistent image
  const hash = neighborhoodName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const imageIndex = hash % neighborhoodImages.length
  return neighborhoodImages[imageIndex]
}

export function getBuildingImage(buildingName: string, index: number = 0): string {
  // Use building name to get consistent image
  const hash = buildingName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const imageIndex = hash % buildingImages.length
  return buildingImages[imageIndex]
}

