import { roomRects, walls, type RoomId } from '@/lib/cinematic/plan';
export default function FloorPlan({ active, dark = false }: { active?: RoomId; dark?: boolean }) {
  return <svg viewBox="-8 -8 196 156" className={`floorplan ${dark ? 'floorplan-dark' : ''}`} role="img" aria-label="Level 18 floor plan showing the connected living room, dining room, kitchen, gallery, two bedrooms and bathrooms">
    <rect x="0" y="0" width="180" height="140" fill={dark ? '#c7cec9' : '#dddcd2'} fillOpacity={dark ? .08 : .6}/>
    {Object.entries(roomRects).map(([id, rect]) => <rect key={id} x={(rect.x + 9) * 10} y={(rect.z + 7) * 10} width={rect.w * 10} height={rect.d * 10} fill={active === id ? '#c6a87b' : dark ? '#b8c4bf' : '#bdc5b8'} fillOpacity={active === id ? .7 : .15}/>)}
    {walls.map((wall, i) => <rect key={i} x={(wall.x + 9 - wall.w / 2) * 10} y={(wall.z + 7 - wall.d / 2) * 10} width={Math.max(1, wall.w * 10)} height={Math.max(1, wall.d * 10)} fill={dark ? '#d0d5cb' : '#4e5c53'}/>)}
    <path d="M0 0H180V140H0Z" fill="none" stroke={dark ? '#aabbb6' : '#626f68'} strokeWidth="1"/>
    <g fill="none" stroke={dark ? '#99aaa1' : '#8c9788'} strokeWidth=".7"><rect x="123" y="92" width="13" height="37" rx="2"/><rect x="54" y="93" width="25" height="14" rx="2"/><rect x="130" y="64" width="28" height="11" rx="2"/><rect x="9" y="20" width="22" height="27" rx="1"/><rect x="12" y="91" width="25" height="25" rx="1"/><rect x="99" y="4" width="50" height="11"/><rect x="109" y="35" width="40" height="10"/></g>
  </svg>;
}
