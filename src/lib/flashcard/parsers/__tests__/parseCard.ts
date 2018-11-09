import { ContentState } from "draft-js";
import * as fromAction from "../../../../reducers/actions/.";
import card, * as fromCard from "../../../../reducers/card";
import * as Utils from "../../../utils";
import { ExportFlashCard } from "../../flashcard";
import * as fromCardParse from "../parseCard";

test("export and import", () => {
    const setId = "setId123";
    const cardId = "cardId123";
    let state: any = fromCard.cardValue({
        tags: ["tag1", "tag2"],
    }, cardId, fromAction.Action.addNewCardBegin(cardId, setId));
    state = fromCard.cardValue(state, cardId, fromAction.Action.saveCardFaceBegin(
        cardId,
        setId,
        {
            ...state.faces.front,
            richTextContent: ContentState.createFromText("This is a test"),
        },
    ));

    // Export and reimport the card
    const exportedCard = new ExportFlashCard(state);
    const reimportedCard: any = fromCardParse.parseCard(exportedCard, setId, () => { return; });

    // Richtextcontent is randomly generated, so it is reduced to a constant value
    state.faces.front.richTextContent = state.faces.front.richTextContent.getPlainText();
    state.faces.back.richTextContent = state.faces.back.richTextContent.getPlainText();
    reimportedCard.faces.front.richTextContent = reimportedCard.faces.front.richTextContent.getPlainText();
    reimportedCard.faces.back.richTextContent = reimportedCard.faces.back.richTextContent.getPlainText();

    expect(state).toEqual(reimportedCard);
});
