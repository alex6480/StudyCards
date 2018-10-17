import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import StudyCardsApp from "./components/StudyCardsApp";
import { LocalStorageProvider } from "./lib/storage/LocalStorageProvider";
import { setStorageProvider } from "./lib/storage/StorageProvider";
import reducer from "./reducers";

import "./mystyles.scss";

setStorageProvider(new LocalStorageProvider(400));
const store = createStore(reducer, applyMiddleware(thunk));

ReactDOM.render(
    <Provider store={store}>
        <StudyCardsApp />
    </Provider>,
    document.getElementById("app"),
);
