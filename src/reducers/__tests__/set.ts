import * as fromActions from "../actions";
import * as fromSet from "../set";

test("added card is added in the correct position", () => {
    const setId = "setId123";
    let state = fromSet.setValue({ id: setId }, fromActions.Action.addSetComplete(setId));
    expect(state.cardOrder).toStrictEqual([]);
    expect(state.filteredCardOrder.value).toStrictEqual([]);

    state = fromSet.setValue(state, fromActions.Action.addNewCardBegin("cardId1", setId));
    expect(state.cardOrder).toStrictEqual(["cardId1"]);
    expect(state.filteredCardOrder.value).toStrictEqual(["cardId1"]);

    state = fromSet.setValue(state, fromActions.Action.addNewCardBegin("cardId2", setId));
    expect(state.cardOrder).toStrictEqual(["cardId2", "cardId1"]);
    expect(state.filteredCardOrder.value).toStrictEqual(["cardId2", "cardId1"]);

    state = fromSet.setValue(state,
        fromActions.Action.addNewCardBegin("cardId3", setId, state.cards.cardId2.value!));
    expect(state.cardOrder).toStrictEqual(["cardId2", "cardId3", "cardId1"]);
    expect(state.filteredCardOrder.value).toStrictEqual(["cardId2", "cardId3", "cardId1"]);

    state = fromSet.setValue(state,
        fromActions.Action.addNewCardBegin("cardId4", setId, state.cards.cardId1.value!));
    expect(state.cardOrder).toStrictEqual(["cardId2", "cardId3", "cardId1", "cardId4"]);
    expect(state.filteredCardOrder.value).toStrictEqual(["cardId2", "cardId3", "cardId1", "cardId4"]);
});

describe("available tags", () => {
    const setId = "setId123";
    let state = fromSet.setValue({ id: setId }, fromActions.Action.addSetComplete(setId));
    state = fromSet.setValue(state, fromActions.Action.addNewCardBegin("cardId1", setId));
    state = fromSet.setValue(state, fromActions.Action.addNewCardBegin("cardId2", setId));
    state = fromSet.setValue(state, fromActions.Action.addNewCardBegin("cardId3", setId));
    expect(state.availableTags).toStrictEqual({});

    state = fromSet.setValue(state, fromActions.Action.saveCardMetaBegin(setId, "cardId2", {
        tags: ["tag1", "tag2"],
    }));
    expect(state.availableTags).toStrictEqual({
        tag1: 1,
        tag2: 1,
    });

    state = fromSet.setValue(state, fromActions.Action.saveCardMetaBegin(setId, "cardId3", {
        tags: ["tag2", "tag3"],
    }));
    expect(state.availableTags).toStrictEqual({
        tag1: 1,
        tag2: 2,
        tag3: 1,
    });

    state = fromSet.setValue(state, fromActions.Action.deleteCardBegin(setId, "cardId3"));
    expect(state.availableTags).toStrictEqual({
        tag1: 1,
        tag2: 1,
    });
});
