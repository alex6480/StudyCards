export class FlashCard {
    public id: number;
    public front: string = "";
    public back: string = "";
    public isNewlyCreated: boolean = true;

    constructor (id: number) {
        this.id = id;
    }
}

export class FlashCardSet {
    public cards: { [id: number] : FlashCard; };
    public name: string;
    private lastId: number = 0;

    constructor() {
        this.cards = {};
        this.name = "New Set"
    }

    get cardCount(): number {
        return Object.keys(this.cards).length;
    }

    public nextId(): number {
        var id = this.lastId;
        this.lastId++;
        return id;
    }
}