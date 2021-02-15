import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";

import dataReducer from "./reducers/dataReducer";
import userReducer from "./reducers/userReducer";
import uiReducer from "./reducers/uiReducer";
import chatReducer from "./reducers/chatReducer";

const initialState = {};

const middleware = [thunk];

const reducers = combineReducers({
	data: dataReducer,
	user: userReducer,
	chat: chatReducer,
	ui: uiReducer,
});

const composeEnhancers =
	typeof (window as any) === "object" &&
	(window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
		? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
		: compose;

const enhancer = composeEnhancers(applyMiddleware(...middleware));
const store = createStore(reducers, initialState, enhancer);

export default store;
