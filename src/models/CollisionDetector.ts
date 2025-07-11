import { Grid } from './Grid';
import { ShapeBase } from './Shape';

export class CollisionDetector {
    constructor(private grid: Grid) {}

    canPlaceShapeAt(shape: ShapeBase, row: number, col: number): boolean {
        const matrix = shape.matrix;

        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[0].length; c++) {
                if (matrix[r][c] === 0) continue;

                const targetRow = row + r;
                const targetCol = col + c;

                const cell = this.grid.getCell(targetRow, targetCol);
                if (cell === null || cell.value === 1) return false;
            }
        }

        return true;
    }
}