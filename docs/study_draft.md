## Terms
**Study deck:** The set of cards picked out for a study session
**Due date:** The earliest day a card can be drawn into a study deck
**Redraw time:** The time within a study session that a card should be shown again.
**Study new card limit (default 15):** The number of new cards (cards that have not been studied before) that will be put into a study deck.
**Study total card limit (default 30):** The number of cards in a study deck
**Understanding level** This is an internal score that indicates how comfortable the user is with a certain card. This score is used when calculating a new due date. Algorithm is still undecided. Preferably the algorithm should have the following properties:
1. It goes to infinity
2. For low understanding scores, the gap between due dates increases whenever the score is increased
3. For high understanding scores, the gap between due dates decreases when the score is increased (but still stays positive).

## Before beginning a study session
The user can do the following:
1. When no study has taken place today a big button can be clicked to start the study
2. If a study has taken place, but there are still cards due, the user will be informed, but given the option to study anyway.

## Assembling a study deck
When a study session starts:
1. Up to the daily limit of cards are selected.
2. New cards are selected up to their limit and the rest of the deck is filled with known cards.
3. Known cards are selected based on their due date
- Cards with a due date today or earlier can be selected
- The earlier the due date the more likely that the card is selected, but cards with a late due date can still be selected. Exact algorithm has not been decided. An option is to calculate a new temporate due date for each card where they are normally distributed around their actual due date. By adjusting the variance, the user can decide how much they want to focus on old cards or mix them equally.
4. If the daily limit has not been reached based on new and due cards. The user will be given the option to make the last remaining cards will be drawn from the rest of the cards using the weighed algorithm.
5. Cards all have an empty redraw time.

## Studying
During the study session
1. A card is presented to the user.
    1. Cards with a redraw time before the current time are randomly selected.
    2. If no cards have a readraw time before the current time, a random card is selected without a redraw time.
    3. If all cards have a redraw time in the future, the user is shown a card using the algorithm used to make the deck. A random card is selected but cards due early are prefered
2. The user is asked to evaluate the card and can answer the following, based on how well their memory of the card was.
    1. POOR: The user does not feel comfortable with the card and would like to study it again this session. The card is give a due date a random short interval in the future.
    The understanding level of the card is reset to 0.
    2. DECENT: The user feels reasonably comfortable with the card.
    The card is given a reshuffle time slightly longer than if poorly was selected. After selecting this option, the GOOD option will be available the next time this ard is shown.
    3. GOOD: The user feels comfortable with the card.
    The card is taken out of the set. The understanding level of the card is incremented by 1 and a new due date is calculated based on this.
    4. VERY GOOD: The user feels very comfortable with the card.
    The card is taken out of the set. The understanding level of the card is incremented by 2 and a new due date is calculated based on this.

## Completing the session
When the study deck is empty, the study is complete.