import * as Utils from "../utils";

test("object map number", () => {
    expect(Utils.objectMapNumber({
        1: 2,
        2: 3,
        3: 4,
    }, (k, v) => k + v)).toStrictEqual({
        1: 1 + 2,
        2: 2 + 3,
        3: 3 + 4,
    });
});

test("object map string", () => {
    expect(Utils.objectMapString({
        a: "1",
        b: "2",
        c: "3",
    }, (k, v) => k + v)).toStrictEqual({
        a: "a1",
        b: "b2",
        c: "c3",
    });
});

describe("select keys", () => {
    test("parameter is string[]", () => {
        expect(Utils.selectKeys(["a", "b", "c"], k => k !== "a")).toStrictEqual(["b", "c"]);
    });

    test("parameter is object", () => {
        expect(Utils.selectKeys({
            a: "test",
            b: "test3",
            c: "testasa",
        }, k => k !== "a")).toStrictEqual(["b", "c"]);
    });
});

describe("calculate new tag count", () => {
    const beforeTags = {
        tag1: 2,
        tag2: 1,
    };
    test("added tags", () => {
        expect(Utils.calculateNewTagCount(beforeTags, ["tag1"], ["tag1", "tag2"])).toStrictEqual({
            tag1: 2,
            tag2: 2,
        });

        expect(Utils.calculateNewTagCount(beforeTags, ["tag1"], ["tag1", "tag3"])).toStrictEqual({
            tag1: 2,
            tag2: 1,
            tag3: 1,
        });
    });

    test("removed tags", () => {
        expect(Utils.calculateNewTagCount(beforeTags, ["tag1"], [])).toStrictEqual({
            tag1: 1,
            tag2: 1,
        });

        expect(Utils.calculateNewTagCount(beforeTags, ["tag1"], ["tag2"])).toStrictEqual({
            tag1: 1,
            tag2: 2,
        });
    });
});

