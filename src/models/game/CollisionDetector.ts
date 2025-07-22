import { BlockState } from './BlockState';
import { Grid } from './Grid';

export default class CollisionDetector {
    constructor(private grid: Grid) {}

    canPlaceShapeAt(blockState: BlockState): boolean {
        const matrix = blockState.shape.matrix;

        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[0].length; c++) {
                if (matrix[r][c] === 0) continue;

                const targetRow = blockState.position.row + r;
                const targetCol = blockState.position.col + c;

                const cell = this.grid.getCell(targetRow, targetCol);
                if (cell === null || cell.value === 1) return false;
            }
        }

        return true;
    }
}