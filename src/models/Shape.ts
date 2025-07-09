export type ShapeMatrix = number[][];

export abstract class ShapeBase {
    abstract type: string;
    abstract color: string;
    abstract matrix: ShapeMatrix;

    rotateClockwise(): ShapeMatrix {
        return this.matrix[0].map((_, colIndex) =>
            this.matrix.map(row => row[colIndex]).reverse()
        );
    }
}

export class OShape extends ShapeBase {
    type = 'O';
    color = '#ffff00';
    matrix = [
        [1, 1],
        [1, 1]
    ];
}

export class IShape extends ShapeBase {
    type = 'I';
    color = '#00ffff';
    matrix = [
        [1, 1, 1, 1]
    ];
}

export class LShape extends ShapeBase {
    type = 'L';
    color = '#ff7f00';
    matrix = [
        [1, 0],
        [1, 0],
        [1, 1]
    ];
}

export class JShape extends ShapeBase {
    type = 'J';
    color = '0000ff';
    matrix = [
        [0, 1],
        [0, 1],
        [1, 1]
    ];
}

export class SShape extends ShapeBase {
    type = 'S';
    color = 'ff0000';
    matrix = [
        [0, 1, 1],
        [1, 1, 0]
    ];
}

export class ZShape extends ShapeBase {
    type = 'Z';
    color = '#00ff00';
    matrix = [
        [1, 1, 0],
        [0, 1, 1]
    ];
}

export class TShape extends ShapeBase {
    type = 'T';
    color = '#800080';
    matrix = [
        [1, 1, 1],
        [0, 1, 0]
    ];
}

const shapeClasses = [OShape, IShape, LShape, JShape, SShape, ZShape, TShape];

export function getRandomShape(): ShapeBase {
    const ShapeClass = shapeClasses[Math.floor(Math.random() * shapeClasses.length)];
    return new ShapeClass();
}
