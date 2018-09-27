import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import StudyCardsApp from "./components/StudyCardsApp";
import reducer from "./reducers";

import "./mystyles.scss";

const store = createStore(reducer);

ReactDOM.render(
    <Provider store={store}>
        <StudyCardsApp />
    </Provider>,
    document.getElementById("app"),
);
