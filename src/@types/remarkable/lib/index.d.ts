declare module "remarkable/remarkable" {

    import * as Utils from "remarkable/common/utils";
    import Renderer = require("remarkable/renderer");
    import Ruler = require("remarkable/ruler");

    export = Remarkable;

    class Remarkable {
        /**
         * Useful helper functions for custom rendering.
         */
        static utils: typeof Utils;

        inline: { ruler: Ruler };

        block: { ruler: Ruler };

        core: { ruler: Ruler };

        renderer: Renderer;

        /**
         * Markdown parser, done right.
         */
        constructor(options?: Remarkable.Options);

        /**
         * Remarkable offers some "presets" as a convenience to quickly enable/disable
         * active syntax rules and options for common use cases.
         */
        constructor(preset: "commonmark" | "full" | "remarkable", options?: Remarkable.Options);

        /**
         * `"# Remarkable rulezz!"` => `"<h1>Remarkable rulezz!</h1>"`
         */
        render(markdown: string, env?: Remarkable.Env): string;

        /**
         * Define options.
         *
         * Note: To achieve the best possible performance, don't modify a Remarkable instance
         * on the fly. If you need multiple configurations, create multiple instances and
         * initialize each with a configuration that is ideal for that instance.
         */
        set(options: Remarkable.Options): void;

        /**
         * Use a plugin.
         */
        use(plugin: Remarkable.Plugin, options?: any): Remarkable;

        /**
         * Batch loader for components rules states, and options.
         */
        configure(presets: Remarkable.Presets): void;

        /**
         * Parse the input `string` and return a tokens array.
         * Modifies `env` with definitions data.
         */
        parse(str: string, env: Remarkable.Env): Remarkable.Token[];

        /**
         * Parse the given content `string` as a single string.
         */
        parseInline(str: string, env: Remarkable.Env): Remarkable.Token[];

        /**
         * Render a single content `string`, without wrapping it
         * to paragraphs.
         */
        renderInline(str: string, env?: Remarkable.Env): string;
    }

    namespace Remarkable {
        interface Env {
            [key: string]: any;
        }

        type GetBreak = (tokens: Token[], idx: number) => "" | "\n";

        interface Options {
            /**
             * Enable HTML tags in source.
             */
            html?: boolean;

            /**
             * Use "/" to close single tags (<br />).
             */
            xhtmlOut?: boolean;

            /**
             * Convert "\n" in paragraphs into <br>.
             */
            breaks?: boolean;

            /**
             * CSS language prefix for fenced blocks.
             */
            langPrefix?: string;

            /**
             * Autoconvert URL-like text to links.
             */
            linkify?: boolean;

            /**
             * Enable some language-neutral replacement + quotes beautification.
             */
            typographer?: boolean;

            /**
             * Double + single quotes replacement pairs, when typographer enabled,
             * and smartquotes on. Set doubles to "«»" for Russian, "„“" for German.
             */
            quotes?: string;

            /**
             * Highlighter function. Should return escaped HTML, or "" if the source
             * string is not changed.
             */
            highlight?(str: string, lang: string): string;
        }

        type Plugin = (md: Remarkable, options?: any) => void;

        interface Presets {
            components: {
                [name: string]: {
                    rules: Rules,
                },
            };

            options: Options;
        }

        type RenderRule = (
            /**
             * The list of tokens currently being processed.
             */
            tokens: Token[],

            /**
             * The index of the token currently being processed.
             */
            idx: number,

            /**
             * The options given to remarkable.
             */
            options: Options,

            /**
             * The key-value store created by the parsing rules.
             */
            env: Env,
        ) => string;

        type ParseRule = (State: State, checkmode: boolean) => void;

        interface State {
            /**
             * The complete string the parser is currently working on (i.e. the current line/block content).
             */
            src: String,

            /**
             * The current position in src reached by the parser
             */
            pos: number,

            /**
             * The last position available in src
             */
            poxMax: number,

            /**
             * The nested level for the current inline rule
             */
            level: number,

            /**
             * The tokens generated by the parser up to now
             */
            tokens: Token[],

            /**
             * Adds a new token to the (end of the) output
             */
            push: (token: Token) => void;
        }

        interface Rules {
            [name: string]: RenderRule;
            "blockquote_open": RenderRule;
            "blockquote_close": RenderRule;
            "code": RenderRule;
            "fence": RenderRule;
            "fence_custom": RenderRule;
            "heading_open": RenderRule;
            "heading_close": RenderRule;
            "hr": RenderRule;
            "bullet_list_open": RenderRule;
            "bullet_list_close": RenderRule;
            "list_item_open": RenderRule;
            "list_item_close": RenderRule;
            "ordered_list_open": RenderRule;
            "ordered_list_close": RenderRule;
            "paragraph_open": RenderRule;
            "paragraph_close": RenderRule;
            "link_open": RenderRule;
            "link_close": RenderRule;
            "image": RenderRule;
            "table_open": RenderRule;
            "table_close": RenderRule;
            "thead_open": RenderRule;
            "thead_close": RenderRule;
            "tbody_open": RenderRule;
            "tbody_close": RenderRule;
            "tr_open": RenderRule;
            "tr_close": RenderRule;
            "th_open": RenderRule;
            "th_close": RenderRule;
            "td_open": RenderRule;
            "td_close": RenderRule;
            "strong_open": RenderRule;
            "strong_close": RenderRule;
            "em_open": RenderRule;
            "em_close": RenderRule;
            "del_open": RenderRule;
            "del_close": RenderRule;
            "ins_open": RenderRule;
            "ins_close": RenderRule;
            "mark_open": RenderRule;
            "mark_close": RenderRule;
            "sub": RenderRule;
            "sup": RenderRule;
            "hardbreak": RenderRule;
            "softbreak": RenderRule;
            "text": RenderRule;
            "htmlblock": RenderRule;
            "htmltag": RenderRule;
            "abbr_open": RenderRule;
            "abbr_close": RenderRule;
            "footnote_ref": RenderRule;
            "footnote_block_open": RenderRule;
            "footnote_block_close": RenderRule;
            "footnote_open": RenderRule;
            "footnote_close": RenderRule;
            "footnote_anchor": RenderRule;
            "dl_open": RenderRule;
            "dt_open": RenderRule;
            "dd_open": RenderRule;
            "dl_close": RenderRule;
            "dt_close": RenderRule;
            "dd_close": RenderRule;

            /**
             * Check to see if `\n` is needed before the next token.
             */
            getBreak: GetBreak;
        }

        interface BaseToken {
            /**
             * The nesting level of the associated markdown structure in the source.
             */
            level: number;

            /**
             * Tokens generated by block parsing rules also include a `lines`
             * property which is a 2 elements array marking the first and last line of the
             * `src` used to generate the token.
             */
            lines?: [number, number];
        }

        interface TagToken extends BaseToken {
            /**
             * Tag tokens have a variety of types and each is a name of a
             * rendering rule.
             */
            type: string;
        }

        interface ContentToken extends BaseToken {
            /**
             * A text token has a `content` property containing the text it represents.
             */
            content: string;

            /**
             * The type of the token.
             */
            type: "text";
        }

        interface BlockContentToken extends BaseToken {
            /**
             * The content of the block. This might include inline mardown syntax
             * which may need further processing by the inline rules.
             */
            content: string;

            /**
             * This is initialized with an empty array (`[]`) and will be filled
             * with the inline parser tokens as the inline parsing rules are applied.
             */
            children: Token[];

            /**
             * The type of the token.
             */
            type: "inline";
        }

        interface MiscTokenProps {
            /**
             * Image alt.
             */
            alt?: string;

            /**
             * Code: `true` if block, `false` if inline.
             */
            block?: boolean;

            /**
             * Footnote label.
             */
            label?: any;

            /**
             * Heading level.
             */
            hLevel?: number;

            /**
             * Link url.
             */
            href?: string;

            /**
             * Footnote id.
             */
            id?: number;

            /**
             * Ordered list marker value.
             */
            order?: number;

            /**
             * Fenced block params.
             */
            params?: any[];

            /**
             * Image url.
             */
            src?: string;

            /**
             * Footnote sub id.
             */
            subId?: number;

            /**
             * Absence of empty line before current tag: `true` if absent, `false`
             * if present. List is tight if any list item is tight.
             */
            tight?: boolean;

            /**
             * Abbreviation title.
             */
            title?: string;
        }

        type Token = (TagToken | ContentToken | BlockContentToken) & MiscTokenProps;
    }

}