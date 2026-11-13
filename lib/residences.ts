export type Residence = { id: string; floor: number; position: number; bedrooms: number; area: number; terrace: number; available: boolean; name: string; price: number };
export const residences: Residence[] = Array.from({ length: 24 }, (_, i) => {
  const floor = i + 2;
  return { id: `${floor}A`, floor, position: 0, bedrooms: 2, area: floor === 18 ? 218 : [204, 218, 232][i % 3], terrace: 0,
    available: ![7, 12, 21].includes(floor), name: floor === 18 ? 'The Park Residence' : 'The Skyline Residence', price: 1_150_000_000 + i * 25_000_000 };
});
export const unitsOnFloor = (floor: number) => residences.filter(unit => unit.floor === floor);
export const availableOnFloor = (floor: number) => unitsOnFloor(floor).filter(unit => unit.available);
export function getResidence(id: string) { return residences.find(unit => unit.id === id); }
export const money = (price: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price);
export const featuredResidence = residences.find(unit => unit.floor === 18)!;
