import { ContentState } from "draft-js";
import IFlashCard from "../../lib/flashcard/flashcard";
import { FlashCardFaceType } from "../../lib/flashcard/FlashCardFace";
import { Actions } from "../actions";
import card from "../card";

describe("newly added card", () => {
    const setId = "test";
    const action = Actions.addNewCard(setId);

    it("has an id", () => {
        const newCard = card(undefined, action);
        expect(newCard.id).toBeTruthy();
    });

    it("has faces with correct ids", () => {
        const newCard = card(undefined, action);
        expect(newCard.faces.front).toBeTruthy();
        expect(newCard.faces.front.id).toBe("front");
        expect(newCard.faces.back).toBeTruthy();
        expect(newCard.faces.back.id).toBe("back");
    });

    it("has correct set id", () => {
        const newCard = card(undefined, action);
        expect(newCard.setId === setId);
    });

    it("has faces with correct set ids", () => {
        const newCard = card(undefined, action);
        expect(newCard.faces.front.setId).toBe(setId);
        expect(newCard.faces.back.setId).toBe(setId);
    });
});

describe("existing card added", () => {
    const setId = "test";
    const cardId = "test";
    const addedCard: IFlashCard = {
        setId,
        id: cardId,
        faces: {
            front: {
                id: "front",
                type: FlashCardFaceType.None,
                setId,
                cardId,
            },
            back: {
                id: "front",
                type: FlashCardFaceType.RichText,
                setId,
                cardId,
                richTextContent: ContentState.createFromText("test"),
            },
        },
    };

    it("all properties added", () => {
        expect(card(addedCard, Actions.addNewCard(setId))).toEqual(addedCard);
    });

    it("throw error on wrong face ids", () => {
        const cardErrorFront: IFlashCard = {
            ...addedCard,
            faces: {
                front: {
                    ...addedCard.faces.front,
                    id: "back",
                },
                back: {
                    ...addedCard.faces.back,
                },
            },
        };
        expect(card(cardErrorFront, Actions.addNewCard(setId))).toThrowErrorMatchingSnapshot();

        const cardErrorBack: IFlashCard = {
            ...addedCard,
            faces: {
                front: {
                    ...addedCard.faces.front,
                },
                back: {
                    ...addedCard.faces.back,
                    id: "front",
                },
            },
        };
        expect(card(cardErrorBack, Actions.addNewCard(setId))).toThrowErrorMatchingSnapshot();
    });
});

describe("swap card faces", () => {
    const setId = "test";
    const cardId = "test";
    const swappedCard: IFlashCard = {
        setId,
        id: cardId,
        faces: {
            front: {
                id: "front",
                type: FlashCardFaceType.None,
                setId,
                cardId,
            },
            back: {
                id: "front",
                type: FlashCardFaceType.RichText,
                setId,
                cardId,
                richTextContent: ContentState.createFromText("test"),
            },
        },
    };

    expect(card(swappedCard, Actions.swapCardFaces(swappedCard.setId, swappedCard.id)))
        .toEqual(
            {
                ...swappedCard,
                faces: {
                    front: {
                        ...swappedCard.faces.back,
                        id: "front",
                    },
                    back: {
                        ...swappedCard.faces.front,
                        id: "back",
                    },
                },
            },
        );
});
