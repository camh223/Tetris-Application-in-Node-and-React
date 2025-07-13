import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Grid } from '../models/Grid';
import { ShapeBase, ShapeFactory } from '../models/Shape';
import { CollisionDetector } from '../models/CollisionDetector';
import InputHandler from '../models/InputHandler';
import './Board.css';
import axios from '../api/axios';

interface Position {
    row: number;
    col: number;
}

const NUM_ROWS = 20;
const NUM_COLS = 10;
const BASE_INTERVAL = 500;
const START_POSITION = { row: 0, col: 4};

const Board: React.FC = () => {
    const { user } = useAuth();

    const [grid, setGrid] = useState(() => new Grid(NUM_ROWS, NUM_COLS));
    const [currentShape, setCurrentShape] = useState<ShapeBase>(() => ShapeFactory.random());
    const [nextShape, setNextShape] = useState<ShapeBase>(() => ShapeFactory.random());
    const [position, setPosition] = useState<Position>(START_POSITION);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [linesCleared, setLinesCleared] = useState(0);
    const [level, setLevel] = useState(0);
    const [isNewHighScore, setIsNewHighScore] = useState(false);

    const collisionDetector = useRef(new CollisionDetector(grid));
    const gravityInterval = useRef<number | null>(null);
    const inputHandler = useRef<InputHandler | null>(null);

    useEffect(() => {
        collisionDetector.current = new CollisionDetector(grid);
    }, [grid]);

    useEffect(() => {
        inputHandler.current = new InputHandler(handleInput);
        inputHandler.current.bindListeners();
        startGravity();

        return () => {
            inputHandler.current?.unbindListeners();
            if (gravityInterval.current) clearInterval(gravityInterval.current);
        };
    }, []);

    const startGravity = useCallback(() => {
        if (gravityInterval.current) clearInterval(gravityInterval.current);
        const intervalTime = BASE_INTERVAL * Math.pow(0.9, level);
        gravityInterval.current = window.setInterval(() => {
            handleGravity();
        }, intervalTime);
    }, [level]);

    useEffect(() => {
        startGravity();
    }, [level, startGravity]);

    const handleInput = useCallback((action: string) => {
        if (isGameOver) return;

        let newPosition = { ...position };
        switch (action) {
            case 'MOVE_LEFT':
                newPosition.col -= 1;
                if (collisionDetector.current.canPlaceShapeAt(currentShape, newPosition.row, newPosition.col)) {
                    setPosition(newPosition);
                }
                break;
            case 'MOVE_RIGHT':
                newPosition.col += 1;
                if (collisionDetector.current.canPlaceShapeAt(currentShape, newPosition.row, newPosition.col)) {
                    setPosition(newPosition);
                }
                break;
            case 'SOFT_DROP':
                newPosition.row += 1;
                if (collisionDetector.current.canPlaceShapeAt(currentShape, newPosition.row, newPosition.col)) {
                    setPosition(newPosition);
                }
                break;
            case 'ROTATE':
                const rotatedShape = currentShape.copy();
                rotatedShape.rotate();
                if (collisionDetector.current.canPlaceShapeAt(rotatedShape, position.row, position.col)) {
                    setCurrentShape(rotatedShape);
                }
                break;
        }
    }, [currentShape, position, isGameOver]);

    const handleGravity = useCallback(() => {
        if (!currentShape || isGameOver) return;

        const nextPosition = { row: position.row + 1, col: position.col };
        const canPlace = collisionDetector.current.canPlaceShapeAt(currentShape, nextPosition.row, nextPosition.col);
        
        if (canPlace) {
            setPosition(nextPosition);
        } else {
            const newGrid = grid.clone();
            newGrid.mergeShape(currentShape.matrix, position, currentShape.color, currentShape.type);

            const clearResult = newGrid.clearLines();
            const points = calculateScore(clearResult.linesCleared);
            const totalLinesCleared = linesCleared + clearResult.linesCleared;
            const newLvl = Math.floor(totalLinesCleared / 10);

            setGrid(newGrid);
            setScore(prev => prev + points);
            setLinesCleared(totalLinesCleared);
            setLevel(newLvl);

            spawnNextShape(newGrid);

            if (newLvl > level) {
                startGravity();
            }
        }
    }, [currentShape, position, grid, isGameOver, linesCleared, level, startGravity]);

    const spawnNextShape = useCallback((currentGrid: Grid) => {
        const newPosition = START_POSITION;

        if (!collisionDetector.current.canPlaceShapeAt(nextShape, newPosition.row, newPosition.col)) {
            setIsGameOver(true);
            checkAndSaveHighScore();
            inputHandler.current?.unbindListeners();
            if (gravityInterval.current) clearInterval(gravityInterval.current);
            return;
        }

        setCurrentShape(nextShape);
        setPosition(newPosition);
        setNextShape(ShapeFactory.random())
    }, [nextShape]);

    const updateHighScoreApi = useCallback(async (newScore: number) => {
        try {
            const res = await axios.post(
                '/user/highscore',
                { score: newScore },
                { withCredentials: true }
            );
            return res.data;
        } catch (error) {
            console.error("Failed to update high score:", error);
            throw error;
        }
    }, []);

    const checkAndSaveHighScore = useCallback(async () => {
        if (!user) return;
        if (score > (user.highScore ?? 0)) {
            try {
                const result = await updateHighScoreApi(score);
                if (result.isNewHighScore) {
                    setIsNewHighScore(true);
                }
            } catch (error) {
                console.error("Failed to save high score:", error);
            }
        }
    }, [score, user, updateHighScoreApi]);

    const calculateScore = (lines: number): number => {
        const basePoints = [0, 100, 300, 500, 800];
        const levelMultiplier = level + 1;
        return (basePoints[lines] || 0) * levelMultiplier;
    };

    const resetGame = () => {
        const newShape = ShapeFactory.random();
        setGrid(new Grid(NUM_ROWS, NUM_COLS));
        setCurrentShape(newShape);
        setNextShape(ShapeFactory.random());
        setPosition({ row: 0, col: 4});
        setIsGameOver(false);
        setScore(0);
        setLinesCleared(0);
        setLevel(0);
        setIsNewHighScore(false);

        collisionDetector.current = new CollisionDetector(new Grid(NUM_ROWS, NUM_COLS));
        inputHandler.current?.bindListeners();
        startGravity();
    };

    const getRenderGrid = () => {
        const baseGrid = grid.getMatrix();
        const shapeMatrix = currentShape.matrix;
        const tempGrid = baseGrid.map(row =>
            row.map(cell => ({
                value: cell.value,
                color: cell.value ? (cell.color || '#999') : 'transparent',
                shapeType: cell.shapeType
            }))
        );

        shapeMatrix.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const y = position.row + rowIndex;
                const x = position.col + colIndex;
                if (cell !== 0 && y >= 0 && y < NUM_ROWS && x >= 0 && x < NUM_COLS) {
                    tempGrid[y][x] = {
                        value: cell,
                        color: currentShape.color,
                        shapeType: currentShape.type,
                    };
                }
            });
        });

        return tempGrid;
    };

    const renderGrid = getRenderGrid();

    return (
        <div className="board-container">
            <h1>Tetris</h1>

            <div className="next-shape-container">
                <h2>Next</h2>
                <div className="next-shape">
                    {nextShape.matrix.map((row, rIdx) => (
                        <div key={rIdx} className="row">
                            {row.map((cell, cIdx) => (
                                <div
                                    key={cIdx}
                                    className="cell"
                                    style={{
                                        backgroundColor: cell !== 0 ? nextShape.color : 'transparent',
                                        border: cell !== 0 ? '1px solid #444' : 'none',
                                        width: 20,
                                        height: 20,
                                        display: 'inline-block',
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="scoreboard">
                <p>Score: {score}</p>
                <p>Lines: {linesCleared}</p>
                <p>Level: {level}</p>
                {isNewHighScore && <p className="high-score">New High Score!</p>}
            </div>

            <div
                className="grid"
                style={{
                    display: 'grid',
                    gridTemplateRows: `repeat(${NUM_ROWS}, 25px)`,
                    gridTemplateColumns: `repeat(${NUM_COLS}, 25px)`,
                    gap: '1px',
                    backgroundColor: '#222',
                    border: '2px solid #555',
                }}
            >
                {renderGrid.map((row, rIdx) =>
                    row.map((cell, cIdx) => (
                        <div
                            key={`${rIdx}-${cIdx}`}
                            className="cell"
                            style={{
                                backgroundColor: cell.color,
                                border: cell.value ? '1px solid #999' : '1px solid #333',
                                width: 25,
                                height: 25,
                                boxSizing: 'border-box',
                            }}
                        />
                    ))
                )}
            </div>

            {isGameOver && (
                <div className="game-over-overlay">
                    <h2>Game Over</h2>
                    <button onClick={resetGame}>Restart</button>
                </div>
            )}
        </div>
    );
};

export default Board;


/* import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Grid } from '../models/Grid';
import { ShapeBase, ShapeFactory } from '../models/Shape';
import { CollisionDetector } from '../models/CollisionDetector';
import InputHandler from '../models/InputHandler';
import './Board.css';

interface Position {
    row: number;
    col: number;
}

interface BoardState {
    grid: Grid;
    currentShape: ShapeBase;
    nextShape: ShapeBase;
    position: Position;
    isGameOver: boolean;
    score: number;
    linesCleared: number;
    level: number;
    isNewHighScore: boolean;
}

class Board extends Component<{}, BoardState> {
    static contextType = AuthContext;
    context!: React.ContextType<typeof AuthContext>;
    
    numRows = 20;
    numCols = 10;
    baseInterval = 500;
    gravityInterval: number | undefined;
    inputHandler: InputHandler;
    collisionDetector: CollisionDetector;

    constructor(props: {}) {
        super(props);

        const initialShape = ShapeFactory.random();

        this.state = {
            grid: new Grid(this.numRows, this.numCols),
            currentShape: initialShape,
            nextShape: ShapeFactory.random(),
            position: { row: 0, col: 4},
            isGameOver: false,
            score: 0,
            linesCleared: 0,
            level: 0,
            isNewHighScore: false,
        };

        this.collisionDetector = new CollisionDetector(this.state.grid);
        this.inputHandler = new InputHandler(this.handleInput);
    }

    componentDidMount(): void {
        this.inputHandler.bindListeners();
        this.startGravity();
    }

    componentWillUnmount(): void {
        this.inputHandler.unbindListeners();
    }

    startGravity() {
        if (this.gravityInterval) clearInterval(this.gravityInterval);
        const intervalTime = this.baseInterval * Math.pow(0.9, this.state.level);
        this.gravityInterval = window.setInterval(() => this.handleGravity(), intervalTime);
    }

    handleInput = (action: string): void => {
        const { currentShape, position } = this.state;
        let newPosition = { ...position };

        switch (action) {
            case "MOVE_LEFT":
                newPosition.col -= 1;
                if (this.collisionDetector.canPlaceShapeAt(currentShape, newPosition.row, newPosition.col)) {
                    this.setState({ position: newPosition });
                }
                break;
            case "MOVE_RIGHT":
                newPosition.col += 1;
                if (this.collisionDetector.canPlaceShapeAt(currentShape, newPosition.row, newPosition.col)) {
                    this.setState({ position: newPosition });
                }
                break;
            case "SOFT_DROP":
                newPosition.row += 1;
                if (this.collisionDetector.canPlaceShapeAt(currentShape, newPosition.row, newPosition.col)) {
                    this.setState({ position: newPosition });
                }
                break;
            case "ROTATE":
                const rotatedShape = currentShape.copy();
                rotatedShape.rotate();

                if (this.collisionDetector.canPlaceShapeAt(rotatedShape, newPosition.row, newPosition.col)) {
                    this.setState({ currentShape: rotatedShape });
                }
                break;
        }
    }

    handleGravity(): void {
        if (!this.state.currentShape || this.state.isGameOver) return;

        const { currentShape, position, grid } = this.state;
        const nextPosition = { row: position.row + 1, col: position.col};

        const canPlaceShape = this.collisionDetector.canPlaceShapeAt(currentShape, nextPosition.row, nextPosition.col);

        if (canPlaceShape) {
            this.setState({ position: nextPosition });
        } else {
            const newGrid = grid.clone();
            newGrid.mergeShape(currentShape.matrix, position, currentShape.color, currentShape.type);

            // Check for completed lines and clear them
            const clearResult = newGrid.clearLines();
            const points = this.calculateScore(clearResult.linesCleared);
            const newLinesCleared = this.state.linesCleared + clearResult.linesCleared;
            const newLevel = Math.floor(newLinesCleared / 10);

            this.setState({ 
                grid: newGrid,
                score: this.state.score + points,
                linesCleared: newLinesCleared,
                level: newLevel
            }, () => {
                this.collisionDetector = new CollisionDetector(this.state.grid);
                
                // Restart gravity with new level speed
                if (newLevel > this.state.level) {
                    this.startGravity();
                }
                
                this.spawnNextShape();
            });
        }
    }

    spawnNextShape(): void {
        const next = ShapeFactory.random();
        const newPosition = { row: 0, col: 4};

        if (!this.collisionDetector.canPlaceShapeAt(this.state.nextShape, newPosition.row, newPosition.col)) {
            this.setState({ isGameOver: true }, () => {
                this.checkAndSaveHighScore();
            });
            this.inputHandler.unbindListeners();
            clearInterval(this.gravityInterval);
            return;
        }

        this.setState({ 
            currentShape: this.state.nextShape,
            position: newPosition,
            nextShape: next 
        });
    }

    async checkAndSaveHighScore(): Promise<void> {
        if (!this.context) return;
        
        const { user, updateHighScore } = this.context;
        
        if (user && this.state.score > user.highScore) {
            try {
                const result = await updateHighScore(this.state.score);
                if (result.isNewHighScore) {
                    this.setState({ isNewHighScore: true });
                }
            } catch (error) {
                console.error('Failed to save high score:', error);
            }
        }
    }

    private getRenderGrid(): { value: number, color: string, shapeType?: string }[][] {
        const { grid, currentShape, position } = this.state;
        const baseGrid = grid.getMatrix();
        const shapeMatrix = currentShape.matrix;

        const tempGrid: { value: number, color: string, shapeType?: string }[][] = baseGrid.map(row =>
            row.map(cell => ({
                value: cell.value,
                color: cell.value ? (cell.color || '#999') : 'transparent',
                shapeType: cell.shapeType
            }))
        );

        shapeMatrix.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const y = position.row + rowIndex;
                const x = position.col + colIndex;
                if (cell && y >= 0 && y < this.numRows && x >= 0 && x < this.numCols) {
                    tempGrid[y][x] = {
                        value: cell,
                        color: currentShape.color,
                        shapeType: currentShape.type
                    };
                }
            });
        });

        return tempGrid;
    }

    private resetGame(): void {
        const newShape = ShapeFactory.random();
        this.setState({
            grid: new Grid(this.numRows, this.numCols),
            currentShape: newShape,
            nextShape: ShapeFactory.random(),
            position: { row: 0, col: 4},
            isGameOver: false,
            score: 0,
            linesCleared: 0,
            level: 0,
            isNewHighScore: false,
        }, () => {
            this.collisionDetector = new CollisionDetector(this.state.grid);
            this.inputHandler.bindListeners();
            this.startGravity();
        })
    }

    calculateScore(linesCleared: number): number {
        const basePoints = [0, 100, 300, 500, 800]; // Points for 0, 1, 2, 3, 4 lines
        const levelMultiplier = this.state.level + 1;
        return (basePoints[linesCleared] || 0) * levelMultiplier;
    }

    render() {
        const {
            score, level, linesCleared, isGameOver, 
            nextShape, isNewHighScore
        } = this.state;
        const renderGrid = this.getRenderGrid();

        if (!this.context) return null;
        const { user } = this.context;

        return (
            <div className="game-container">
                <div className="game-board">
                    {renderGrid.map((row, rowIndex) => (
                        <div key ={rowIndex} className="board-row">
                            {row.map((cell, colIndex) => (
                                <div
                                    key={colIndex}
                                    className="cell"
                                    style = {{
                                        width: '30px',
                                        height: '30px',
                                        backgroundColor: cell.value ? cell.color : 'transparent',
                                        border: cell.value ? '1px solid #444' : '1px solid transparent',
                                        borderRadius: '4px'
                                    }}
                                />
                            ))}
                        </div>
                    ))}

                    {isGameOver && (
                        <div className="game-over-overlay">
                            <div className="game-over-content">
                                <h1>Game Over</h1>
                                {isNewHighScore && <h2 style={{ color: 'gold' }}>New High Score!</h2>}
                                <p>Score: {score}</p>
                                <p>Level: {level}</p>
                                {user && <p>Your High Score: {user.highScore}</p>}
                                <button onClick={this.resetGame}>Restart</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="side-panel">
                    <div className="info">
                        <h2>Score:</h2>
                        <p>{score}</p>
                        <h2>Level:</h2>
                        <p>{level}</p>
                        <h2>Lines:</h2>
                        <p>{linesCleared}</p>
                        {user && (
                        <>
                            <h2>High Score:</h2>
                            <p>{user.highScore}</p>
                        </>
                        )}
                    </div>
                    <div className="next-preview">
                        <h2>Next</h2>
                        {nextShape.matrix.map((row, rowIndex) => (
                            <div key={rowIndex} className="next-shape-row">
                                {row.map((cell, colIndex) => (
                                    <div
                                        key={`${rowIndex}-${colIndex}`}
                                        className="cell"
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            backgroundColor: cell ? nextShape.color : 'transparent',
                                            border: cell ? '1px solid #444' : '1px solid transparent',
                                            borderRadius: '4px'
                                        }}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

export default Board; */