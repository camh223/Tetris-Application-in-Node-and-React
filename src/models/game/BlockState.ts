import { ShapeBase } from "./Shape";

interface Position {
    row: number;
    col: number;
}

export interface BlockState {
    position: Position,
    shape: ShapeBase
}