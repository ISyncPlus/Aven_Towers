'use client';
import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { navigationReducer, initialNavigation, type Action } from '@/lib/cinematic/navigation';
import { rooms, FEATURED_LEVEL } from '@/lib/cinematic/plan';
import { featuredResidence, getResidence, money } from '@/lib/residences';
import VisitDialog from '../VisitDialog';
import { Icon } from '../Icons';
import FloorPlan from './FloorPlan';
const Scene = dynamic(() => import('./CinematicScene'), { ssr: false });
class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}
export default function CinematicExperience() {
  const [nav, dispatch] = useReducer(navigationReducer, initialNavigation);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [dusk, setDusk] = useState(true);
  const [menu, setMenu] = useState(false);
  const [plan, setPlan] = useState(false);
  const [capture, setCapture] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const pendingWalk = useRef(false);
  const surface = useRef<HTMLDivElement>(null);
  const latest = useRef(nav); latest.current = nav;
  const stage = nav.stage;
  const touring = stage === 'tour';
  const overview = stage === 'cutaway' || stage === 'overview';
  const activeRoom = rooms[Math.min(nav.active, rooms.length - 1)];
  const selected = stage === 'hero' ? getResidence(`${nav.floor}A`) || featuredResidence : featuredResidence;
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(true); }, []);
  useEffect(() => { if (!failed) return; if (nav.stage === 'entering') dispatch({ type: 'ENTERED' }); else if (nav.stage === 'tour' && nav.busy) { dispatch({ type: 'ACTIVE', index: nav.target }); dispatch({ type: 'ARRIVED' }); } }, [failed, nav.stage, nav.request, nav.busy, nav.target]);
  const command = useCallback((action: Action) => { setMenu(false); dispatch(action); }, []);
  const openVisit = () => { setMenu(false); dialog.current?.showModal(); };
  const enter = () => { pendingWalk.current = false; command({ type: stage === 'hero' ? 'ENTER' : 'CUTAWAY' }); };
  const startWalk = () => {
    if (stage === 'hero') { pendingWalk.current = true; command({ type: 'ENTER' }); }
    else command({ type: 'ROOM', index: 0 });
  };
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(media.matches); update(); media.addEventListener('change', update); return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (stage !== 'cutaway' || !pendingWalk.current) return;
    const timer = window.setTimeout(() => { pendingWalk.current = false; dispatch({ type: 'ROOM', index: 0 }); }, reduced ? 0 : 900);
    return () => window.clearTimeout(timer);
  }, [stage, reduced]);
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const requested = query.get('capture');
    if (!requested) return;
    const index = rooms.findIndex(room => room.id === requested);
    setCapture(true); setReduced(true);
    if (requested === 'tower') dispatch({ type: 'TOWER' }); else if (requested === 'cutaway') dispatch({ type: 'CUTAWAY' }); else if (index >= 0) dispatch({ type: 'ROOM', index });
  }, []);
  useEffect(() => {
    if (!surface.current) return;
    let wheelTotal = 0, last = 0, touchY = 0;
    const step = (direction: number) => {
      const current = latest.current;
      if (current.stage === 'entering') return;
      if (current.stage === 'hero') { if (direction > 0) dispatch({ type: 'ENTER' }); return; }
      if (current.stage === 'cutaway') { dispatch(direction > 0 ? { type: 'ROOM', index: 0 } : { type: 'TOWER' }); return; }
      if (current.target === 0 && direction < 0) { dispatch({ type: 'CUTAWAY' }); return; }
      dispatch({ type: 'ROOM', index: Math.max(0, Math.min(8, current.target + direction)) });
    };
    const wheel = (event: WheelEvent) => {
      if (dialog.current?.open || (event.target as HTMLElement).closest('button,input,select,.floor-panel,.residence-sheet')) return;
      if (latest.current.stage === 'cutaway' || latest.current.stage === 'overview') return;
      event.preventDefault(); wheelTotal += event.deltaY;
      const now = performance.now();
      if (Math.abs(wheelTotal) > 70 && now - last > 700) { step(Math.sign(wheelTotal)); wheelTotal = 0; last = now; }
    };
    const key = (event: KeyboardEvent) => {
      if (dialog.current?.open || (event.target as HTMLElement).closest('input,textarea,select') || event.altKey || event.metaKey || event.ctrlKey) return;
      if (event.key === 'Escape') { setMenu(false); setPlan(false); if (latest.current.stage !== 'hero') dispatch({ type: 'CUTAWAY' }); }
      if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) { event.preventDefault(); step(event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1); }
    };
    const touchStart = (event: TouchEvent) => { touchY = event.touches[0]?.clientY || 0; };
    const touchEnd = (event: TouchEvent) => { if ((event.target as HTMLElement).closest('button,input,.floor-panel') || dialog.current?.open) return; const dy = touchY - (event.changedTouches[0]?.clientY || 0); if (Math.abs(dy) > 65 && latest.current.stage === 'tour') step(Math.sign(dy)); };
    const element = surface.current;
    element.addEventListener('wheel', wheel, { passive: false }); element.addEventListener('touchstart', touchStart, { passive: true }); element.addEventListener('touchend', touchEnd, { passive: true }); window.addEventListener('keydown', key);
    return () => { element.removeEventListener('wheel', wheel); element.removeEventListener('touchstart', touchStart); element.removeEventListener('touchend', touchEnd); window.removeEventListener('keydown', key); };
  }, []);
  const roomCommand = (index: number) => { setPlan(false); command({ type: 'ROOM', index }); };
  return <main className={`cinematic stage-${stage} ${capture ? 'capture-mode' : ''} ${failed ? 'has-fallback' : ''}`} data-stage={stage} data-busy={nav.busy} data-ready={ready}>
    <a className="skip-link" href="#experience-controls">Skip to experience controls</a>
    <div className="cinematic-canvas" ref={surface} role="img" aria-label={stage === 'hero' ? 'Aven glass residential tower in a landscaped sunset city' : 'A coherent furnished Level 18 apartment, explored in real time'}>
      {!failed && <SceneBoundary onError={onFailure}><Scene navigation={nav} dispatch={dispatch} reduced={reduced || capture} dusk={dusk} onReady={onReady} onFailure={onFailure} capture={capture}/></SceneBoundary>}
      {failed && <img className="fallback-picture" src={`/fallback/${stage === 'hero' ? 'tower' : overview ? 'cutaway' : activeRoom.id}.jpg`} alt={stage === 'hero' ? 'Aven tower architectural view' : `${activeRoom.name} at Aven, Level 18`}/>}
    </div>
    <div className="cinematic-scrim"/>
    <header className="cinematic-header">
      <button className="aven-brand" onClick={() => command({ type: 'TOWER' })} aria-label="Aven home"><svg width="27" height="32" viewBox="0 0 36 38" fill="none" aria-hidden="true"><path d="M4 32 18 5l14 27M10 23h16M10 32l8-16 8 16" stroke="currentColor" strokeWidth="1.2"/></svg><span>AVEN<small>RESIDENCES · LAGOS</small></span></button>
      <nav className={menu ? 'cinematic-nav is-open' : 'cinematic-nav'} aria-label="Primary navigation"><button onClick={() => command({ type: 'TOWER' })}>The tower</button><button onClick={enter}>The residence</button><button onClick={startWalk}>The walkthrough</button><button className="gallery-menu-action" onClick={() => { setFailed(!failed); setMenu(false); }}>{failed ? 'Enable 3D view' : 'Architectural gallery'}</button></nav>
      <button className="pill-button header-enquire" onClick={openVisit}><span className="desktop-word">Arrange a viewing</span><span className="mobile-word">Enquire</span><span className="round-arrow"><Icon name="arrow" size={15}/></span></button>
      <button className="cinematic-menu" aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <Icon name="close"/> : <><span/><span/></>}</button>
    </header>
    <div id="experience-controls" tabIndex={-1} className="experience-interface">
      {stage === 'hero' && <>
        <section className="tower-story"><p className="eyebrow">A new perspective on park living</p><h1>RISE<br/>ABOVE<br/>THE PARK</h1><p className="tower-intro">A private collection of full-floor residences.<br/>Above the green. Connected to Lagos.</p><div className="hero-actions"><button className="pill-button" onClick={enter}>Explore Level 18 <Icon name="arrow" size={15}/></button><button className="quiet-button" onClick={openVisit}>Arrange a viewing</button></div></section>
        <aside className="floor-panel" aria-label="Choose a residence floor" data-ui>
          <div className="floor-panel-top"><span>Find your perspective</span><span className="available-dot">{selected.available ? 'Available' : 'Reserved'}</span></div>
          <div className="floor-main"><div><span className="floor-number" key={nav.floor}>{String(nav.floor).padStart(2, '0')}</span><span className="floor-level">Level</span></div><div className="floor-arrows"><button aria-label="Previous floor" onClick={() => dispatch({ type: 'FLOOR', floor: nav.floor === 2 ? 25 : nav.floor - 1 })}><Icon name="left" size={17}/></button><button aria-label="Next floor" onClick={() => dispatch({ type: 'FLOOR', floor: nav.floor === 25 ? 2 : nav.floor + 1 })}><Icon name="right" size={17}/></button></div></div>
          <h2>{selected.name}</h2><p className="floor-home-type">A private full-floor home</p>
          <dl className="floor-facts"><div><dt>Interior</dt><dd>{selected.area} m²</dd></div><div><dt>Bedrooms</dt><dd>2 suites</dd></div><div><dt>Purchase price</dt><dd>{money(selected.price)}</dd></div></dl>
          <div className="floor-schematic"><FloorPlan dark/><span>Signature residence · Level 18</span></div>
          <button className="floor-explore" onClick={enter}>{nav.floor === FEATURED_LEVEL ? 'Explore this residence' : 'Tour the featured Level 18'}<span><Icon name="arrow" size={17}/></span></button>
          {nav.floor !== FEATURED_LEVEL && <button className="level-enquiry" onClick={openVisit}>Enquire about Level {nav.floor}</button>}
        </aside>
        <dl className="tower-statistics"><div><dd>26</dd><dt>Storeys</dt></div><div><dd>24</dd><dt>Private homes</dt></div><div><dd>218<span>m²</span></dd><dt>Signature residence</dt></div><div><dd>2</dd><dt>Bedroom suites</dt></div></dl>
        <div className="hero-tools"><span>Explore a different level</span><button className="lighting-control" onClick={() => setDusk(!dusk)} aria-label={dusk ? 'Switch to daylight' : 'Switch to sunset'}><Icon name={dusk ? 'sun' : 'moon'} size={16}/>{dusk ? 'Daylight' : 'Sunset'}</button></div>
      </>}
      {stage === 'entering' && <div className="journey-status" role="status"><span className="loading-line"/>{ready ? 'Your arrival at Level 18' : 'Preparing the residence'}</div>}
      {overview && <>
        <div className="residence-topline"><button className="back-control" onClick={() => command({ type: 'TOWER' })}><Icon name="left" size={16}/> Back to the tower</button><span>THE PARK RESIDENCE</span></div>
        <div className="cutaway-title"><p>Level 18</p><span>218 m² · Two bedroom suites · One private address</span></div>
        <div className="cutaway-actions"><button className="pill-button dark-pill" onClick={() => roomCommand(0)}>{stage === 'overview' ? 'Replay the walkthrough' : 'Begin the walkthrough'}<Icon name="arrow" size={16}/></button><button className="quiet-button" onClick={() => setPlan(!plan)}>View floor plan</button></div>
        <p className="orbit-instruction">{failed ? 'Choose a room below to explore' : 'Drag to explore · Pinch or scroll to zoom'}</p>
      </>}
      {touring && <>
        <button className="tour-exit back-control" onClick={() => command({ type: 'CUTAWAY' })}><Icon name="left" size={15}/> Apartment overview</button>
        <article className="room-story" key={activeRoom.id} aria-live="polite" data-ui><span className="room-category">{activeRoom.category}</span><h1>{activeRoom.headline}</h1><p>{activeRoom.description}</p><dl>{activeRoom.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></article>
        <button className="tour-plan-toggle" aria-label="Show apartment floor plan" onClick={() => setPlan(!plan)}><FloorPlan active={activeRoom.id}/><span>Level 18</span></button>
      </>}
      {(touring || overview) && <footer className="tour-navigation" data-ui><button className="nav-arrow" aria-label="Previous room" onClick={() => nav.target <= 0 ? command({ type: 'CUTAWAY' }) : roomCommand(nav.target - 1)}><Icon name="left" size={17}/></button><div className="room-markers" role="group" aria-label="Walkthrough rooms">{rooms.map((room, index) => <button key={room.id} className={`${nav.active === index && touring ? 'is-active' : ''} ${nav.busy && nav.target === index ? 'is-pending' : ''}`} aria-label={`Go to ${room.name}`} aria-current={touring && nav.active === index ? 'step' : undefined} onClick={() => roomCommand(index)}><span/><em>{room.name}</em></button>)}</div><button className="nav-arrow" aria-label={nav.target >= 7 ? 'Finish with apartment overview' : 'Next room'} onClick={() => roomCommand(Math.min(8, nav.target + 1))}><Icon name="right" size={17}/></button><div className="tour-current">{nav.busy ? 'In motion' : overview ? 'The complete residence' : activeRoom.name}</div></footer>}
      {plan && stage !== 'hero' && <aside className="residence-sheet" data-ui><button className="sheet-close" aria-label="Close floor plan" onClick={() => setPlan(false)}><Icon name="close" size={18}/></button><p>The Park Residence</p><h2>Level 18</h2><FloorPlan active={touring ? activeRoom.id : undefined}/><dl><div><dt>Interior</dt><dd>218 m²</dd></div><div><dt>Bedrooms</dt><dd>2 suites</dd></div><div><dt>Bathrooms</dt><dd>2</dd></div><div><dt>Purchase price</dt><dd>{money(featuredResidence.price)}</dd></div></dl><button className="pill-button dark-pill" onClick={openVisit}>Arrange a private viewing <Icon name="arrow" size={16}/></button></aside>}
      {failed && <div className="gallery-notice" role="status">Architectural gallery · Select a room to explore</div>}
      {!ready && stage === 'hero' && <div className="subtle-loading" role="status">Preparing Level 18<span/></div>}
    </div>
    <VisitDialog dialogRef={dialog} selected={selected.available ? selected : null}/>
    <noscript><div className="no-script"><h1>Aven. Rise above the park.</h1><img src="/fallback/tower.jpg" alt="The Aven tower in its landscaped sunset setting"/><p>A private collection of 24 full-floor residences in Lagos. Level 18 offers 218 m², two bedroom suites and panoramic views.</p></div></noscript>
  </main>;
}
