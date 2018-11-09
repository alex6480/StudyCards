import { History } from "history";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IUser } from "../lib/User";
import { IAppState } from "../reducers";
import { UserService } from "../services/user.service";

interface ILoginPageState {
    loginError: string | null;
    email: string;
    password: string;
    rememberMe: boolean;
    isLoggingIn: boolean;
}

interface ILoginPageOwnProps {
    history: History<any>;
}

interface ILoginPageStateProps {
    user: IUser | null;
}

interface ILoginPageDispatchProps {
    logIn: (email: string, password: string) => Promise<IUser>;
}

interface ILoginPageProps extends ILoginPageOwnProps, ILoginPageDispatchProps, ILoginPageStateProps { }

class LoginPage extends React.Component<ILoginPageProps, ILoginPageState> {
    constructor(props: ILoginPageProps) {
        super(props);

        this.state = {
            loginError: null,
            email: "",
            password: "",
            isLoggingIn: false,
            rememberMe: false,
        };
    }

    public componentWillMount() {
        if (this.props.user !== null) {
            this.props.history.replace("/dashboard");
        }
    }

    public render() {
        return <section>
            <div className="container">
                <form className="box login-box"
                    onSubmit={this.props.logIn.bind(this)}>
                    <h1 className="title is-3">Log In</h1>

                    { /* Email field */ }
                    <div className="field">
                        <label className="label">Email</label>
                        <div className="control has-icons-left has-icons-right">
                            <input className={"input"
                                 + (this.state.loginError !== null ? " is-danger" : "")
                                 + (this.props.user !== null ? " is-success" : "")}
                                value={this.state.email}
                                onChange={e => this.setState({ email: e.target.value })}
                                type="email" placeholder="Email"
                                readOnly={this.state.isLoggingIn} />
                            <span className="icon is-small is-left">
                                <i className="fas fa-envelope fa-xs"></i>
                            </span>
                        </div>
                    </div>

                    { /* Password field */ }
                    <div className="field">
                        <label className="label">Password</label>
                        <div className="control has-icons-left has-icons-right">
                            <input className={"input"
                                 + (this.state.loginError !== null ? " is-danger" : "")
                                 + (this.props.user !== null ? " is-success" : "")}
                                type="password"
                                placeholder="Password"
                                value={this.state.password}
                                onChange={e => this.setState({ password: e.target.value })}
                                readOnly={this.state.isLoggingIn} />
                            <span className="icon is-small is-left">
                                <i className="fas fa-key fa-xs"></i>
                            </span>
                        </div>
                        { this.state.loginError !== null && <p className="help is-danger">{this.state.loginError}</p> }
                    </div>

                    <div className="columns">
                        <div className="column">
                            { /* Remember me */ }
                            <label className="checkbox">
                                <input type="checkbox"
                                    id="remember-me"
                                    checked={this.state.rememberMe}
                                    onChange={e => this.setState({rememberMe: e.target.checked})}/>
                                Remember me
                            </label>
                        </div>
                        <div className="column">
                            { /* Forgot password */ }
                            <a className="forgot-password">Forgot your password?</a>
                        </div>
                    </div>

                    { /* Sign in button */ }
                    { ! this.state.isLoggingIn
                         ? <input type="submit"
                            className="button is-primary is-fullwidth"
                            onClick={this.login.bind(this)}
                            value="Log In" />
                        : <button
                            className="button is-primary is-fullwidth is-loading">
                            Log In
                        </button> }
                </form>

                <p className="sign-up">Don't have an account? <a>Sign Up</a></p>
            </div>
        </section>;
    }

    private login() {
        if (this.props.user != null || this.state.isLoggingIn) {
            // Prevent double logins
            return;
        }

        if (this.state.email === "") {
            this.setState({ loginError: "Please enter your email" });
        } else if (this.state.password === "") {
            this.setState({ loginError: "Please enter your password" });
        } else {
            this.setState({ isLoggingIn: true });
            this.props.logIn(this.state.email, this.state.password)
                .then(user => {
                    // Clear previous errors
                    this.setState({ loginError: null });
                    setTimeout(() => this.props.history.replace("/dashboard"), 1000);
                })
                .catch((error: "unknown" | "invalid_user") => {
                    this.setState({
                        loginError: error === "unknown"
                        ? "An unknown error occured"
                        : "Username or password is invalid",
                        password: "",
                        isLoggingIn: false,
                    });
                });
        }
    }
}

function mapStateToProps(state: IAppState): ILoginPageStateProps {
    return {
        user: state.user,
    };
}

function mapDispatchToProps(dispatch: Dispatch): ILoginPageDispatchProps {
    return {
        logIn: (email: string, password: string) =>
            dispatch<any>(UserService.logIn(email, password)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
