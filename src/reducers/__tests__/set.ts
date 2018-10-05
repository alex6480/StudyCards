import IFlashCardSet from "../../lib/flashcard/FlashCardSet";
import { Actions } from "../actions";
import * as fromCard from "../card";
import set from "../set";

const state: IFlashCardSet = {
    id: "test",
    cards: {
        a: {
            ...fromCard.initialState,
            id: "a",
        },
        b: {
            ...fromCard.initialState,
            id: "b",
        },
    },
    cardOrder: ["a", "b"],
    name: "test",
};

describe("card added", () => {
    describe("to end of set", () => {
        test("callback called", () => {
            const callback = jest.fn();
            set(state, Actions.addNewCard(state.id, undefined, callback));
            expect(callback).toBeCalled();
        });

        test("order correct", () => {
            let id: string = "";
            const callback = (newId: string) => {
                id = newId;
            };
            const newState = set(state, Actions.addNewCard(state.id, undefined, callback));
            expect(newState.cardOrder).toStrictEqual(["a", "b", id]);
        });
    });

    describe("at specific position in set", () => {
        test("callback called", () => {
            const callback = jest.fn();
            set(state, Actions.addNewCard(state.id, "a", callback));
            expect(callback).toBeCalled();
        });

        test("order correct", () => {
            let id: string = "";
            const callback = (newId: string) => {
                id = newId;
            };
            const newState = set(state, Actions.addNewCard(state.id, "a", callback));
            expect(newState.cardOrder).toStrictEqual(["a", id, "b"]);
        });
    });
});

describe("action performed on different set (different id)", () => {
    test("update card face", () => {
        const updatedState = set(state, Actions.updateCardFace("wrong-id", "a", state.cards.a.faces.front));
        expect(updatedState).toStrictEqual(state);
    });

    test("swap card faces", () => {
        const updatedState = set(state, Actions.swapCardFaces("wrong-id", "a"));
        expect(updatedState).toStrictEqual(state);
    });

    test("update name", () => {
        const updatedState = set(state, Actions.updateSetName({...state, id: "wrong-id"}, "something"));
        expect(updatedState).toStrictEqual(state);
    });
});

test("update name (correct id)", () => {
    const newName = "new-name";
    const updatedState = set(state, Actions.updateSetName(state, newName));
    expect(updatedState.name).toBe(newName);
});
