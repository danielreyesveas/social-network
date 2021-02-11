import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";

import dataReducer from "./reducers/dataReducer";

const initialState = {};

const middleware = [thunk];

const reducers = combineReducers({
	data: dataReducer,
});

const composeEnhancers =
	typeof (window as any) === "object" &&
	(window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
		? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
		: compose;

const enhancer = composeEnhancers(applyMiddleware(...middleware));
const store = createStore(reducers, initialState, enhancer);

export default store;
