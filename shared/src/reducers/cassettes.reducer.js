import { combineReducers } from 'redux';
import { createSelector } from 'reselect';

import {
  CASSETTES_LIST_SUCCESS,
  CASSETTES_LIST_FAILURE,
  EJECT_CASSETTE,
  GO_TO_NEXT_CASSETTE_PAGE,
  GO_TO_PREVIOUS_CASSETTE_PAGE,
  HIDE_CASSETTES,
  SELECT_CASSETTE,
  VIEW_CASSETTES,
} from '../actions';


const defaultStates = {
  status: 'idle',
  selected: null,
  byId: {},
  page: {
    number: 0,
    limit: 5,
  },
};


function statusReducer(state = defaultStates.status, action) {
  switch (action.type) {
    case VIEW_CASSETTES: return 'selecting';
    case CASSETTES_LIST_FAILURE:
    case EJECT_CASSETTE:
    case HIDE_CASSETTES: return 'idle';
    case SELECT_CASSETTE: return 'loaded';
    default: return state;
  }
}

function selectedReducer(state = defaultStates.selected, action) {
  switch (action.type) {
    case SELECT_CASSETTE: return action.id;
    default: return state;
  }
}

function byIdReducer(state = defaultStates.byId, action) {
  switch (action.type) {
    case CASSETTES_LIST_SUCCESS: return action.cassettes;
    default: return state;
  }
}

function pageNumberReducer(state = defaultStates.page.number, action) {
  switch (action.type) {
    case GO_TO_NEXT_CASSETTE_PAGE: return state + 1;
    case GO_TO_PREVIOUS_CASSETTE_PAGE: return state - 1;
    default: return state;
  }
}

function pageLimitReducer(state = defaultStates.page.limit, action) {
  switch (action.type) {
    default: return state;
  }
}


export default combineReducers({
  status: statusReducer,
  selected: selectedReducer,
  byId: byIdReducer,
  page: combineReducers({
    number: pageNumberReducer,
    limit: pageLimitReducer,
  }),
});


// ////////////////////////
// SELECTORS /////////////
// //////////////////////
console.log('\n\n\nREADING FILE\n\n\n');
const cassettesById = state => state.reduxVCR.cassettes.byId;
const cassettePageNumberSelector = state => state.reduxVCR.cassettes.page.number;
const cassettePageLimitSelector = state => state.reduxVCR.cassettes.page.limit;

export const cassetteListSelector = createSelector(
  cassettesById,
  (cassettes) => {
    const cassetteIds = Object.keys(cassettes);

    return cassetteIds
      .map(id => ({ id, ...cassettes[id] }))
      .sort((a, b) => b.timestamp - a.timestamp);
  }
);

export const paginatedCassetteListSelector = createSelector(
  cassetteListSelector,
  cassettePageNumberSelector,
  cassettePageLimitSelector,
  (cassetteList, pageNumber, pageLimit) => {
    const startIndex = pageNumber * pageLimit;
    const endIndex = startIndex + pageLimit;

    return cassetteList.slice(startIndex, endIndex);
  }
);

export const isFirstPageSelector = createSelector(
  cassettePageNumberSelector,
  (pageNumber) => pageNumber === 0
);

export const isLastPageSelector = createSelector(
  cassetteListSelector,
  cassettePageNumberSelector,
  cassettePageLimitSelector,
  (cassetteList, pageNumber, pageLimit) => {
    // Page numbers are zero-indexed, but we want them to be one-indexed.
    const truePageNumber = pageNumber + 1;

    const numOfCassettes = cassetteList.length;
    const numOfPages = Math.ceil(numOfCassettes / pageLimit);

    return truePageNumber >= numOfPages;
  }
);
