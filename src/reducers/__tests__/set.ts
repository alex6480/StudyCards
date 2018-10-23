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
