## Terms
**Study deck:** The set of cards picked out for a study session
**Due date:** The earliest day a card can be drawn into a study deck
**Redraw time:** The time within a study session that a card should be shown again.
**Study new card limit (default 15):** The number of new cards (cards that have not been studied before) that will be put into a study deck.
**Study total card limit (default 30):** The number of cards in a study deck
**Understanding level** This is an internal score that indicates how comfortable the user is with a certain card. This score is used when calculating a new due date. Algorithm is still undecided.

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
    1. POOR: The user does not remember the card or important details on the card. The card is given a redraw time a random short interval in the future.
    2. DECENT: The user remembers the important parts of the card, but would still like to see the card again this study session. The card is given a redraw time date a random medium interval in the future.
    3. GOOD: The user remembered the card in a satisfying way. This removes the card from the current study session and the understanding score for the card is updated.

## Calculating the uderstanding score
For each card the following considerations are made
1. If the user chose GOOD on the first card evaluation, the understanding level will be incremented. If this happens in multiple different study sessions in a row, the understanding level will be exponentially incremented.
2. If the user hit POOR on a card (no matter what other evaluations the same card got) it will be have its undetstanding level reset.
3. If the user hit DECENT one or more times before hitting GOOD the understanding score is neither decreased or increased. However, depending on how many times the user hit DECENT, the score will be capped.
Maybe something along the lines of (where the number is the number of time the card was evaluated DECENT before GOOD):
    1. Understanding level is capped so the card will be drawn in no more than 4 days.
    2. Understanding level is capped so the card will be drawn in  no more than 3 days
    3. Understanding level is capped so the card will be prioritized to be drawn in no more than 2 days.
    4. The understanding level of the card is reset as if it was given the poor evaluation

## Completing the session
When the study deck is empty, the study is complete.
The user should be shown statistics about the cards