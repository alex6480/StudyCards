import * as React from "react";
import { Link } from "react-router-dom";

interface ISetNavProps {
    setId: number;
    activePage: "study" | "edit" | "properties" | "export";
}

export default function SetNav(props: ISetNavProps) {
    return <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
        <div className="navbar-menu container">
            <div className="navbar-start">
                <Link className="navbar-item" to="/dashboard">
                    <span className="icon icon-small">
                        <i className="fas fa-arrow-left"></i>
                    </span>&nbsp;
                    Back
                </Link>
                <Link className="navbar-item" to={"/set/" + props.setId + "/study"}>Study</Link>
                <Link className="navbar-item" to={"/set/" + props.setId + "/edit"}>Edit Cards</Link>
                <Link className="navbar-item" to={"/set/" + props.setId + "/properties"}>Set Properties</Link>
                <Link className="navbar-item" to={"/set/" + props.setId + "/export"}>Export</Link>
            </div>
        </div>
    </nav>;
}
