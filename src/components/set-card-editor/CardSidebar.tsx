import * as React from "react";

interface ICardSidebarProps {
    onDelete?: () => void;
}

export const CardSidebar: React.SFC<ICardSidebarProps> = (props) => {
    return <div className="flashcard-sidebar">
        <a onClick={props.onDelete}>
            <span className="icon">
                <i className={"fas fa-trash"}></i>
            </span>
        </a>
    </div>;
};
