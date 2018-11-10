import * as React from "react";

interface ISetNotFoundProps {
    setId: number;
}

const SetNotFound: React.SFC<ISetNotFoundProps> = (props) => {
    return <div className="container">Cannot find set with id {props.setId}</div>;
};
export default SetNotFound;
