import FlashCardSet, { ExportFlashCardSet } from "../FlashCardSet";
export type ParseError = string;

export interface ISetParser {
    parse: (set: ExportFlashCardSet, onSucces: (set: FlashCardSet) => void, onError: (errors: ParseError[]) => void) => void;
    exportVersion: string;
}