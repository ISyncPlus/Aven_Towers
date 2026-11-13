export type Vec3 = [number, number, number];
export type RoomId = 'living' | 'panorama' | 'dining' | 'kitchen' | 'hall' | 'guest' | 'primary' | 'bathroom';
export const FEATURED_LEVEL = 18;
export const LEVELS = 26;
export const FLOOR_HEIGHT = 3.5;
export const levelBase = (level: number) => 5 + (level - 2) * FLOOR_HEIGHT;
export const RESIDENCE_Y = levelBase(FEATURED_LEVEL);
export const APARTMENT = { width: 18, depth: 14, height: 3.2, area: 218, bedrooms: 2, bathrooms: 2 };
export type Wall = { x: number; z: number; w: number; d: number };
// Openings in these shared wall segments are used by both the model and camera-clearance checks.
export const walls: Wall[] = [
  { x: 2.725, z: -7, w: 12.55, d: .18 },
  { x: -3.55, z: -4.15, w: .15, d: 5.7 },
  { x: -3.55, z: 4.2, w: .15, d: 5.6 },
  { x: -7.7, z: -1.25, w: 2.6, d: .15 },
  { x: -4.375, z: -1.25, w: 1.65, d: .15 },
  { x: -3, z: -1.25, w: 1.1, d: .15 },
  { x: -.725, z: -1.25, w: 1.05, d: .15 },
  { x: -.2, z: -4.125, w: .15, d: 5.75 },
  { x: -7.1, z: 1.4, w: 3.8, d: .15 },
  { x: -3.775, z: 1.4, w: .45, d: .15 },
  { x: -2.775, z: 1.4, w: 1.55, d: .15 },
  { x: -.5, z: 1.4, w: .6, d: .15 },
  { x: -.2, z: 4.2, w: .15, d: 5.6 },
];
export const roomRects: Record<Exclude<RoomId, 'panorama'>, { x: number; z: number; w: number; d: number }> = {
  living: { x: .1, z: 2, w: 8.7, d: 4.8 },
  dining: { x: 3.8, z: -1.7, w: 4.9, d: 3.5 },
  kitchen: { x: .2, z: -6.8, w: 8.5, d: 4.6 },
  hall: { x: -8.8, z: -1.1, w: 8.8, d: 2.3 },
  guest: { x: -8.8, z: -6.8, w: 5.1, d: 5.4 },
  primary: { x: -8.8, z: 1.6, w: 5.1, d: 5.2 },
  bathroom: { x: -3.35, z: 1.6, w: 2.95, d: 5.2 },
};
export function insideWall(x: number, z: number, margin = .1) {
  return walls.some(wall => Math.abs(x - wall.x) < wall.w / 2 + margin && Math.abs(z - wall.z) < wall.d / 2 + margin);
}
export const rooms: { id: RoomId; name: string; category: string; headline: string; description: string; facts: [string, string][]; hotspot: Vec3 }[] = [
  { id: 'living', name: 'Living', category: 'The living room', headline: 'Oak, bouclé and a field of colour', description: 'Sculptural seating and warm oak frame a quieter kind of city living. Beyond the glass, Lagos opens to the evening sky.', facts: [['Floor', 'Natural oak'], ['Upholstery', 'Ivory bouclé'], ['Outlook', 'Park & city']], hotspot: [3.5, .15, 4.3] },
  { id: 'panorama', name: 'The view', category: 'The panoramic corner', headline: 'The city, with room to breathe', description: 'Full-height corner glazing brings the horizon into the home. Slender frames leave the sunset almost uninterrupted.', facts: [['Glazing', 'Full height'], ['Level', 'Eighteen'], ['Orientation', 'Corner aspect']], hotspot: [7.7, .15, 5.8] },
  { id: 'dining', name: 'Dining', category: 'The dining room', headline: 'A table for the long evenings', description: 'Solid timber, upholstered chairs and a sculptural arrangement. A place for unhurried conversations above the treetops.', facts: [['Setting', 'Six places'], ['Table', 'Natural timber'], ['Lighting', 'Sculptural pendant']], hotspot: [5.6, .15, -.2] },
  { id: 'kitchen', name: 'Kitchen', category: 'The kitchen', headline: 'Sand lacquer, walnut and Calacatta', description: 'Quiet cabinetry meets finely veined stone. Integrated appliances and a generous peninsula keep the everyday beautifully considered.', facts: [['Joinery', 'Sand & walnut'], ['Surfaces', 'Veined stone'], ['Appliances', 'Integrated']], hotspot: [3, .15, -4.7] },
  { id: 'hall', name: 'Gallery', category: 'The private gallery', headline: 'A quieter passage through the home', description: 'Full-height doors, flush storage and a measured rhythm of light connect the shared spaces to the private suites.', facts: [['Doors', 'Full height'], ['Lighting', 'Recessed'], ['Storage', 'Integrated']], hotspot: [-3.9, .15, .1] },
  { id: 'guest', name: 'Guest suite', category: 'The guest bedroom', headline: 'A desk beside the evening sky', description: 'A calm guest room, with a writing desk at the window and open shelves for books, objects and a few things from home.', facts: [['Bed', 'Queen'], ['Workspace', 'Window-side'], ['Wardrobe', 'Fitted']], hotspot: [-6.5, .15, -4.2] },
  { id: 'primary', name: 'Primary suite', category: 'The primary bedroom', headline: 'Wake above the treetops', description: 'Layered linen, a tailored headboard and balanced bedside light. A private retreat shaped around rest and the changing skyline.', facts: [['Bed', 'King'], ['Joinery', 'Walnut & oak'], ['Bedding', 'Natural linen']], hotspot: [-6.5, .15, 4.1] },
  { id: 'bathroom', name: 'Bathroom', category: 'The bathroom', headline: 'Travertine, light and water', description: 'Honed stone, a floating timber vanity and restrained brushed-metal fittings. Warm reflected light completes a quieter morning ritual.', facts: [['Stone', 'Honed finish'], ['Vanity', 'Floating timber'], ['Shower', 'Frameless glass']], hotspot: [-1.8, .15, 4.4] },
];
