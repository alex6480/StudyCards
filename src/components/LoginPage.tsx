import * as React from "react";

export default class LoginPage extends React.Component<{}, {}> {
    constructor(props: {}) {
        super(props);

        this.state = {};
    }

    public render() {
        return <section>
            <div className="container">
                <div className="box login-box">
                    <h1 className="title is-3">Log In</h1>

                    { /* Email field */ }
                    <div className="field">
                        <label className="label">Email</label>
                        <div className="control has-icons-left has-icons-right">
                            <input className="input" type="email" placeholder="Email" />
                            <span className="icon is-small is-left">
                                <i className="fas fa-envelope fa-xs"></i>
                            </span>
                        </div>
                    </div>

                    { /* Password field */ }
                    <div className="field">
                        <label className="label">Password</label>
                        <div className="control has-icons-left has-icons-right">
                            <input className="input" type="password" placeholder="Password" />
                            <span className="icon is-small is-left">
                                <i className="fas fa-key fa-xs"></i>
                            </span>
                        </div>
                    </div>

                    <div className="columns">
                        <div className="column">
                            { /* Remember me */ }
                            <label className="checkbox">
                                <input type="checkbox" id="remember-me" />
                                Remember me
                            </label>
                        </div>
                        <div className="column">
                            { /* Forgot password */ }
                            <a className="forgot-password">Forgot your password?</a>
                        </div>
                    </div>

                    { /* Sign in button */ }
                    <button className="button is-primary is-fullwidth">
                        Sign In
                    </button>
                </div>

                <p className="sign-up">Don't have an account? <a>Sign Up</a></p>
            </div>
        </section>;
    }
}
