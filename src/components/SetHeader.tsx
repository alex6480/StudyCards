import * as React from "react";
import IFlashCardSet from "../lib/flashcard/FlashCardSet";
import IRemote from "../lib/remote";
import EditableText from "./rich-text-editor/EditableText";

interface ISetHeaderProps {
    set: IRemote<IFlashCardSet>;
    goToDashboard: () => void;
    updateSetName: (newName: string) => void;
}

export default class SetHeader extends React.Component<ISetHeaderProps> {
    public render() {
        return <section className="hero is-primary">
            <div className="hero-body">
                <div className="container">
                    <h1 className="title is-1">
                        {this.renderTitle()}
                    </h1>
                    <nav className="breadcrumb subtitle is-6" aria-label="breadcrumbs">
                        <ul>
                            {this.renderBreadcrumbs()}
                        </ul>
                    </nav>
                </div>
            </div>
        </section>;
    }

    private renderTitle() {
        if (this.props.set.value === undefined) {
            // No data is available at all. Just show an empty header
            return <>&nbsp;</>;
        } else if (this.props.set.isFetching) {
            // Show a readonly header with a loading icon
            return <>
                <span className="icon is-large">
                    <i className=" fas fa-spinner fa-pulse "></i>
                </span>
                <EditableText maxLength={30}
                    readOnly={true}
                    value={this.props.set.value.name}
                    onBlur={this.props.updateSetName.bind(this)}/>
            </>;
        } else {
            // Show a normal editable text
            return <EditableText maxLength={30}
                readOnly={false}
                value={this.props.set.value.name}
                onBlur={this.props.updateSetName.bind(this)}/>;
        }
    }

    private renderBreadcrumbs() {
        if (this.props.set.value === undefined) {
            // Show empty breadcrumbs
            return <li>&nbsp;</li>;
        } else {
            // Show the current set in the breadcrumbs
            return <>
                <li><a href="#" onClick={this.props.goToDashboard}>My Sets</a></li>
                <li className="is-active"><a href="#" aria-current="page">
                    {this.props.set.value.name}
                </a></li>
            </>;
        }
    }
}
