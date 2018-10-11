declare module "markdown-draft-js" {
    import { RawDraftContentState } from "draft-js";

    export function draftToMarkdown(rawDraftObject: RawDraftContentState, options: {}): string;
    export function markdownToDraft(markdown: string, options: {}): RawDraftContentState;
}
