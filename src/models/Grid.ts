import { ShapeMatrix } from './Shape';

export interface GridCell {
    value: number;
    color?: string;
    shapeType?: string;
}

export class Grid {
    private numRows: number;
    private numCols: number;
    private matrix: GridCell[][];

    constructor(numRows: number, numCols: number, matrix?: GridCell[][]) {
        this.numRows = numRows;
        this.numCols = numCols;
        this.matrix = matrix ?? this.createEmptyGrid();
    }

    private createEmptyGrid(): GridCell[][] {
        return Array.from({ length: this.numRows }, () => 
            Array(this.numCols).fill(null).map(() => ({ value: 0 }))
        );
    }

    getMatrix(): GridCell[][] {
        return this.matrix.map(row => row.map(cell => ({ ...cell })));
    }

    // Legacy method for backward compatibility
    getLegacyMatrix(): number[][] {
        return this.matrix.map(row => row.map(cell => cell.value));
    }

    setCell(row: number, col: number, value: number, color?: string, shapeType?: string): void {
        if (row >= 0 && row < this.numRows && col >= 0 && col < this.numCols) {
            this.matrix[row][col] = { value, color, shapeType };
        }
    }

    getCell(row: number, col: number): GridCell | null {
        if (row >= 0 && row < this.numRows && col >= 0 && col < this.numCols) {
            return { ...this.matrix[row][col] };
        }
        return null;
    }

    clearLines(): { linesCleared: number; newMatrix: GridCell[][] } {
        const newMatrix = this.matrix.filter(row => row.some(cell => cell.value === 0));
        const linesCleared = this.numRows - newMatrix.length;

        // Pad top of new grid with empty rows to ensure grid size remains constant.
        while (newMatrix.length < this.numRows) {
            newMatrix.unshift(Array(this.numCols).fill(null).map(() => ({ value: 0 })));
        }

        this.matrix = newMatrix;
        return { linesCleared, newMatrix };
    }

    mergeShape(matrix: ShapeMatrix, position: { row: number, col: number}, color: string, shapeType: string): void {
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
                        this.matrix[gridY][gridX] = { 
                            value: matrix[shapeRow][shapeCol], 
                            color,
                            shapeType
                        };
                    }
                }
            }
        }
    }

    clone(): Grid {
        return new Grid(this.numRows, this.numCols, this.getMatrix());
    }
}