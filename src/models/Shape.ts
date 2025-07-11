export type ShapeMatrix = number[][];
export abstract class ShapeBase {
    abstract type: string;
    abstract color: string;
    matrix: ShapeMatrix;

    constructor(matrix: ShapeMatrix) {
        this.matrix = matrix.map(row => [...row]);
    }

    rotateClockwise(): ShapeMatrix {
        return this.matrix[0].map((_, colIndex) =>
            this.matrix.map(row => row[colIndex]).reverse()
        );
    }

    copy(): ShapeBase {
        return ShapeFactory.create(this.type, this.matrix);
    }

    rotate(): void {
        this.matrix = this.rotateClockwise();
    }
}

export class OShape extends ShapeBase {
    type = 'O';
    color = '#ffff00';
    
    constructor(matrix?: ShapeMatrix) {
        super(matrix ?? [
            [1, 1],
            [1, 1]
        ]);
    }
}

export class IShape extends ShapeBase {
    type = 'I';
    color = '#00ffff';

    constructor(matrix?: ShapeMatrix) {
        super(matrix ?? [
            [1, 1, 1, 1]
        ]);
    }
}

export class LShape extends ShapeBase {
    type = 'L';
    color = '#ff7f00';

    constructor(matrix?: ShapeMatrix) {
        super(matrix ?? [
            [1, 0],
            [1, 0],
            [1, 1]
        ]);
    }
}

export class JShape extends ShapeBase {
    type = 'J';
    color = '#0000ff';

    constructor(matrix?: ShapeMatrix) {
        super(matrix ?? [
            [0, 1],
            [0, 1],
            [1, 1]
        ]);
    }
}

export class SShape extends ShapeBase {
    type = 'S';
    color = '#ff0000';

    constructor(matrix?: ShapeMatrix) {
        super(matrix ?? [
            [0, 1, 1],
            [1, 1, 0]
        ]);
    }
}

export class ZShape extends ShapeBase {
    type = 'Z';
    color = '#00ff00';

    constructor(matrix?: ShapeMatrix) {
        super(matrix ?? [
            [1, 1, 0],
            [0, 1, 1]
        ]);
    }
}

export class TShape extends ShapeBase {
    type = 'T';
    color = '#800080';

    constructor(matrix?: ShapeMatrix) {
        super(matrix ?? [
            [1, 1, 1],
            [0, 1, 0]
        ]);
    }
}

export class ShapeFactory {
    static random(): ShapeBase {
        const shapeClasses = [OShape, IShape, LShape, JShape, SShape, ZShape, TShape];
        const ShapeClass = shapeClasses[Math.floor(Math.random() * shapeClasses.length)];
        return new ShapeClass();
    }

    static create(type: string, matrix?: ShapeMatrix): ShapeBase {
        switch (type) {
            case 'O': return new OShape(matrix);
            case 'I': return new IShape(matrix);
            case 'L': return new LShape(matrix);
            case 'J': return new JShape(matrix);
            case 'S': return new SShape(matrix);
            case 'Z': return new ZShape(matrix);
            case 'T': return new TShape(matrix);
            default: throw new Error(`Unknown shape type: ${type}`);
        }
    }
}
