import * as React from "react";

interface ILazyLoadState {
    isVisible: boolean;
    innerHtml: string;
}

export default class LazyLoad extends React.Component<{}, ILazyLoadState> {
    private wrapper: HTMLElement | null = null;

    public constructor(props: {}) {
        super(props);
        this.state = {
            isVisible: true,
            innerHtml: "",
        };
    }

    public render() {
        if (this.state.isVisible) {
            return <div ref={e => this.wrapper = e}>
                {this.props.children}
            </div>;
        } else {
            return <div ref={e => this.wrapper = e} dangerouslySetInnerHTML={{ __html: this.state.innerHtml}}></div>;
        }
    }

    public componentWillMount() {
        window.addEventListener("resize", this.recalculate.bind(this));
        window.addEventListener("scroll", this.recalculate.bind(this));
    }

    public componentDidUpdate() {
        this.recalculate();
    }

    private recalculate() {
        const isOnScreen = this.isOnScreen();
        if (isOnScreen !== this.state.isVisible) {
            if (this.wrapper !== null && this.state.isVisible) {
                this.setState({
                    isVisible: isOnScreen,
                    innerHtml: this.wrapper.innerHTML,
                });
            } else {
                this.setState({
                    isVisible: isOnScreen,
                });
            }
        }
    }

    private isOnScreen() {
        return this.wrapper !== null && this.isElementOnScreen(this.wrapper);
    }

    private isElementOnScreen(element: HTMLElement) {
        const rect = element.getBoundingClientRect();
        const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
        return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
    }
}
