declare module "markdown-draft-js" {
    import { RawDraftContentState } from "draft-js";

    var draftToMarkdown: (rawDraftObject: RawDraftContentState, options: {}) => string;
    export { draftToMarkdown }
}