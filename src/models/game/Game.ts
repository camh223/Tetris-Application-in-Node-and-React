import { BlockState } from "./BlockState";
import CollisionDetector from "./CollisionDetector"
import GameStats from "./GameStats";
import { Grid } from "./Grid";
import InputHandler from "./InputHandler";
import ScoreUploader from "./ScoreUploader";
import { ShapeBase, ShapeFactory } from "./Shape";

const BASE_INTERVAL = 500;
const START_POSITION = { row: 0, col: 4};

export default class Game {
    private gravityInterval: number = BASE_INTERVAL;
    private nextShape: ShapeBase = ShapeFactory.random();
    private currentLevel: number = 0;
    private isGameOver: boolean = false;

    constructor(
        private window: Window,
        private grid: Grid, 
        private collisionDetector: CollisionDetector, 
        private gameStats: GameStats,
        private scoreUploader: ScoreUploader,
        private blockState: BlockState,
        private inputHandler: InputHandler
    ) {}

    public getBlockState(): BlockState {
        return this.blockState;
    }

    public getIsGameOver(): boolean {
        return this.isGameOver;
    }

    public getNextShape(): ShapeBase {
        return this.nextShape;
    }

    public startGame() {
        this.inputHandler.bindListeners();
        this.startGravity();
    }

    public startGravity() {
        this.window.clearInterval(this.gravityInterval);
        let intervalTime = BASE_INTERVAL * Math.pow(0.9, this.currentLevel);
        this.gravityInterval = this.window.setInterval(() => {
            this.handleGravity(this.blockState.position);
        }, intervalTime);
    }

    public handleGravity(position: { row: number, col: number}) {
        if (!this.isGameOver) {
            let newState = { ...this.blockState }
            newState.position.row += 1;
            if (this.collisionDetector.canPlaceShapeAt(newState)) {
                this.blockState = newState;
            } else {
                this.mergeShape();
            }
        }
    }

    public mergeShape() {
        this.grid.mergeShape(this.blockState.shape.matrix, this.blockState.position, this.blockState.shape.color, this.blockState.shape.type);
        
        const linesCleared = this.grid.clearLines()
        this.gameStats.updateScore(linesCleared);
        this.gameStats.updateLevel();
        
        const newLvl = this.gameStats.getLevel();
        if (newLvl > this.currentLevel) {
            this.currentLevel = newLvl;
            this.startGravity();
        }

        this.spawnNextShape();
    }

    public spawnNextShape() {
        const nextShapeState: BlockState = {
            position: START_POSITION,
            shape: this.nextShape
        }
        if (!this.collisionDetector.canPlaceShapeAt(nextShapeState)) {
            this.isGameOver = true;
            this.scoreUploader.checkAndSaveHighScore(this.gameStats.getScore());
            this.inputHandler.unbindListeners();
            this.window.clearInterval(this.gravityInterval);
            return;
        }

        this.blockState = nextShapeState;
        this.nextShape = ShapeFactory.random();
    }
}