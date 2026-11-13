export type Stage = 'hero' | 'entering' | 'cutaway' | 'tour' | 'overview';
export type Navigation = { stage: Stage; floor: number; target: number; active: number; request: number; busy: boolean };
export const initialNavigation: Navigation = { stage: 'hero', floor: 18, target: 0, active: 0, request: 0, busy: false };
export type Action = { type: 'FLOOR'; floor: number } | { type: 'ENTER' } | { type: 'ENTERED' } | { type: 'ROOM'; index: number } | { type: 'ACTIVE'; index: number } | { type: 'ARRIVED' } | { type: 'CUTAWAY' } | { type: 'TOWER' };
export function navigationReducer(state: Navigation, action: Action): Navigation {
  switch (action.type) {
    case 'FLOOR': return action.floor >= 2 && action.floor <= 25 ? { ...state, floor: action.floor } : state;
    case 'ENTER': return { ...state, stage: 'entering', floor: 18, busy: true, request: state.request + 1 };
    case 'ENTERED': return state.stage === 'entering' ? { ...state, stage: 'cutaway', busy: false } : state;
    case 'ROOM': return action.index >= 0 && action.index <= 8 ? { ...state, stage: 'tour', target: action.index, busy: true, request: state.request + 1 } : state;
    case 'ACTIVE': return state.stage === 'tour' && action.index >= 0 && action.index <= 8 ? { ...state, active: action.index } : state;
    case 'ARRIVED': return state.stage !== 'tour' ? state : { ...state, stage: state.target === 8 ? 'overview' : 'tour', active: state.target, busy: false };
    case 'CUTAWAY': return { ...state, stage: 'cutaway', busy: false, request: state.request + 1 };
    case 'TOWER': return { ...initialNavigation, floor: state.floor, request: state.request + 1 };
  }
}
