import * as Remarkable from "remarkable";

export default function remarkableRevealPlugin(md: Remarkable, options: {}) {
    md.inline.ruler.push("reveal", revealParser, {});
}

function revealParser(state: Remarkable.State, checkMode: boolean) {
    
}
