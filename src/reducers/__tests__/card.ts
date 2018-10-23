import { FlashCardFaceType } from "../../lib/flashcard/FlashCardFace";
import * as fromActions from "../actions";
import card from "../card";

test("added card has correct set and card id", () => {
    const cardId = "cardId123";
    const setId = "setId123";

    const action = fromActions.Action.addNewCardBegin(cardId, setId);
    const result = card({
        isFetching: false,
        value: {},
    }, action.payload.cardId, action);

    expect(result).toHaveProperty("value.setId", setId);
    expect(result).toHaveProperty("value.id", cardId);
    expect(result).toHaveProperty("value.faces.front.setId", setId);
    expect(result).toHaveProperty("value.faces.front.cardId", cardId);
    expect(result).toHaveProperty("value.faces.back.setId", setId);
    expect(result).toHaveProperty("value.faces.back.cardId", cardId);
    // Snapshot is taken since the result of this operation is not likely to change often
    expect(result).toMatchSnapshot();
});

test("updated card has correct set and card id", () => {
    const cardId = "cardId123";
    const setId = "setId123";
    const tags = ["tag1", "tag2", "tag3"];
    const state = card(undefined, cardId, fromActions.Action.addNewCardBegin(cardId, setId));
    const updatedState = card(state, cardId,
        fromActions.Action.saveCardMetaBegin(setId, cardId, { id: cardId, setId, tags }));

    expect(updatedState).toHaveProperty("value.id", cardId);
    expect(updatedState).toHaveProperty("value.setId", setId);
    expect(updatedState).toHaveProperty("value.tags", tags);
    // Snapshot is taken since the result of this operation is not likely to change often
    expect(updatedState).toMatchSnapshot();
});

test("updated card face has correct set and card id", () => {
    const cardId = "cardId123";
    const setId = "setId123";
    const state = card(undefined, cardId, fromActions.Action.addNewCardBegin(cardId, setId));
    const result = card(state, cardId,
        fromActions.Action.saveCardFaceBegin(setId, cardId, {
            ...state.value!.faces.back,
            type: FlashCardFaceType.None,
        }));

    expect(result).toHaveProperty("value.setId", setId);
    expect(result).toHaveProperty("value.id", cardId);
    expect(result).toHaveProperty("value.faces.front.setId", setId);
    expect(result).toHaveProperty("value.faces.front.cardId", cardId);
    expect(result).toHaveProperty("value.faces.back.setId", setId);
    expect(result).toHaveProperty("value.faces.back.cardId", cardId);
    expect(result).toHaveProperty("value.faces.front", state.value!.faces.front);
    expect(result).toHaveProperty("value.faces.back.type", FlashCardFaceType.None);
    // Snapshot is taken since the result of this operation is not likely to change often
    expect(result).toMatchSnapshot();
});
