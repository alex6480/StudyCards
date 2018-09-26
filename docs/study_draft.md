## Terms
**Study deck:** The set of cards picked out for a study session
**Due date:** The earliest day a card can be drawn into a study deck
**Due time:** The time within a study session that a card should be shown again.
**Study new card limit (default 15):** The number of new cards (cards that have not been studied before) that will be put into a study deck.
**Study total card limit (default 30):** The number of cards in a study deck
**Restudy interval (hard) (default 3-5 minutes)** The time before a user is shown a card they were uncomfortable with again (within a study session).
**Restudy interval (medium) (default 7-10 minutes)** The time before a user is shown a card they were reasonably comfortable with again (within a study session).

## Assembling a study deck
When a study session starts:
1. Up to the daily limit of cards are selected.
2. New cards are selected up to their limit and the rest of the deck is filled with known cards.
3. Known cards are selected based on their due date
- Cards with a due date today or earlier can be selected
- The earlier the due date the more likely that the card is selected, but cards with a late due date can still be selected
4. If the daily limit has not been reached based on new and due cards, the last remaining cards will be drawn from the rest of the cards using the weighed algorithm.
5. Cards are given a due time for the study session. It starts out being empty.

## Studying
During the study session
1. A card is presented to the user.
    1. Cards with a due time before the current time are randomly selected.
    2. If no cards have a due time before the current time, a random card is selected without a due time.
    3. If no cards are due and no cards don't have a due time, the user is shown a card using the algorithm used to make the deck. A random card is selected but cards due early are prefered
2. The user has 3 to 4 options
    1. HARD: The user does not feel comfortable with the card and would like to study it again this session. The card is give a due date a random short interval in the future.
    2. OK: The user feels reasonably comfortable with the card.
    The card is given a due date slightly longer into the future. The next time this card shows up, option 4 will be available.
    3. EASY: The user feels very comfortable with the card.
    The card has its due date set to 4 days in the future and the card is removed from the current study deck.
    4. OK (reschedule) When the user has answered that they are OK with a card, the next time the card is shown this option will be available. Clicking this option will remove the card from the set and set it's due day to the next day.

## Completing the session
When the study deck is empty, the study is complete.

User options:
1. When no study has taken place today a big button can be clicked to start the study
2. If a study has taken place, but there are still cards due, the user will be informed, but given the option to study anyway.