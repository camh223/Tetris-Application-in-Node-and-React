import { ShapeMatrix } from './Shape';

export class Grid {
    private numRows: number;
    private numCols: number;
    private matrix: number[][];

    constructor(numRows: number, numCols: number, matrix?: number[][]) {
        this.numRows = numRows;
        this.numCols = numCols;
        this.matrix = matrix ?? this.createEmptyGrid();
    }

    private createEmptyGrid(): number[][] {
        return Array.from({ length: this.numRows }, () => Array(this.numCols).fill(0));
    }

    getMatrix(): number[][] {
        return this.matrix.map(row => [...row]);
    }

    setCell(row: number, col: number, value: number): void {
        if (row >= 0 && row < this.numRows && col >= 0 && col < this.numCols) {
            this.matrix[row][col] = value;
        }
    }

    getCell(row: number, col: number): number | null {
        if (row >= 0 && row < this.numRows && col >= 0 && col < this.numCols) {
            return this.matrix[row][col];
        }
        return null;
    }

    clearLines(): { linesCleared: number; newMatrix: number[][] } {
        const newMatrix = this.matrix.filter(row => row.some(cell => cell === 0)); // Removes any lines that don't contain a 0.
        const linesCleared = this.numRows - newMatrix.length;

        // Pad top of new grid with empty rows to ensure grid size remains constant.
        while (newMatrix.length < this.numRows) {
            newMatrix.unshift(Array(this.numCols).fill(0));
        }

        this.matrix = newMatrix;
        return { linesCleared, newMatrix };
    }

    mergeShape(matrix: ShapeMatrix, position: { row: number, col: number}): void {
        for (let shapeRow = 0; shapeRow < matrix.length; shapeRow++) {
            for (let shapeCol = 0; shapeCol < matrix[shapeRow].length; shapeCol++) {
                if (matrix[shapeRow][shapeCol]) {
                    const gridY = position.row + shapeRow;
                    const gridX = position.col + shapeCol;

                    if (
                        gridY >= 0 &&
                        gridY < this.numRows &&
                        gridX >= 0 &&
                        gridX < this.numCols
                    ) {
                        this.matrix[gridY][gridX] = matrix[shapeRow][shapeCol];
                    }
                }
            }
        }
    }

    clone(): Grid {
        return new Grid(this.numRows, this.numCols, this.getMatrix());
    }
}