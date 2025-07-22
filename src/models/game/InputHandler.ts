import { BlockState } from "./BlockState";
import CollisionDetector from "./CollisionDetector";

export default class InputHandler {

    constructor(private blockState: BlockState, private collisionDetector: CollisionDetector) {
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    public bindListeners(): void {
        window.addEventListener("keydown", this.handleKeyDown);
    }

    public unbindListeners(): void {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    private handleKeyDown(e: KeyboardEvent): void {
        e.preventDefault();
        let newState = { ...this.blockState };
        switch (e.code) {
            case "ArrowLeft":
                newState.position.col -= 1;
                break;
            case "ArrowRight":
                newState.position.col += 1;
                break;
            case "ArrowDown":
                newState.position.row += 1;
                break;
            case "ArrowUp":
                newState.shape.rotate();
                break;
        }

        if (this.collisionDetector.canPlaceShapeAt(newState)) {
            this.blockState = newState;
        }
    }
}