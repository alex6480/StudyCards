import * as React from "react";
import * as ReactDOM from "react-dom";

import SetPage from "./components/pages/SetPage"
import { createStore } from "redux";
import reducer from "./reducers";
import { Provider } from "react-redux";
import StudyCardsApp from "./components/StudyCardsApp";

require("./mystyles.scss");

var store = createStore(reducer);

ReactDOM.render(
    <Provider store={store}>
        <StudyCardsApp />
    </Provider>,
    document.getElementById("app")
);