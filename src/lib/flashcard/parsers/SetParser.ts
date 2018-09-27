import IFlashCardSet, { ExportFlashCardSet } from "../FlashCardSet";
export type ParseError = string;

export interface ISetParser {
    parse: (set: ExportFlashCardSet,
            onSucces: (set: IFlashCardSet) => void,
            onError: (errors: ParseError[]) => void) => void;
    exportVersion: string;
}
