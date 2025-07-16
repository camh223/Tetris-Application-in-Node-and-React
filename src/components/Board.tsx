import React, { useState, useEffect, useRef } from 'react';
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
    const { user, setUser } = useAuth();

    const [grid, setGrid] = useState(() => new Grid(NUM_ROWS, NUM_COLS));
    const [currentShape, setCurrentShape] = useState<ShapeBase>(() => ShapeFactory.random());
    const [nextShape, setNextShape] = useState<ShapeBase>(() => ShapeFactory.random());
    const [position, setPosition] = useState<Position>(START_POSITION);
    const [isGameOver, setIsGameOver] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [linesCleared, setLinesCleared] = useState<number>(0);
    const [level, setLevel] = useState<number>(0);
    const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

    const collisionDetector = useRef(new CollisionDetector(grid));
    const gravityInterval = useRef<number | null>(null);
    const inputHandler = useRef<InputHandler | null>(null);

    useEffect(() => {
        collisionDetector.current = new CollisionDetector(grid);
    }, [grid]);

    const handleGravity = () => {
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
    };

    const handleInput = (action: string) => {
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
    };

    const startGravity = () => {
        if (gravityInterval.current) clearInterval(gravityInterval.current);
        const intervalTime = BASE_INTERVAL * Math.pow(0.9, level);
        gravityInterval.current = window.setInterval(() => {
            handleGravity();
        }, intervalTime);
    };

    useEffect(() => {
        inputHandler.current = new InputHandler(handleInput);
        inputHandler.current.bindListeners();
        startGravity();

        return () => {
            inputHandler.current?.unbindListeners();
            if (gravityInterval.current) clearInterval(gravityInterval.current);
        };
    }, [handleInput, startGravity]);

    const calculateScore = (lines: number) => {
        const basePoints = [0, 100, 300, 500, 800];
        const levelMultiplier = level + 1;
        return (basePoints[lines] || 0) * levelMultiplier;
    };

    const spawnNextShape = (currentGrid: Grid) => {
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
    };

    const updateHighScoreApi = async (newScore: number) => {
        try {
            const res = await axios.post(
                '/users/highscore',
                { score: newScore },
                { withCredentials: true }
            );
            if (user) {
                setUser({ ...user, highScore: newScore });
            }
            return res.data;
        } catch (error) {
            console.error("Failed to update high score:", error);
            throw error;
        }
    };

    const updateLeaderboardApi = async (newScore: number) => {
        try {
            await axios.post(
                '/scores/submit',
                { score: newScore }, 
            );
        } catch (error) {
            console.error("Failed to update leaderboard:", error);
            throw error;
        }
    };

    const checkAndSaveHighScore = async () => {
        if (!user) return;
        if (score > (user.highScore ?? 0)) {
            try {
                const result = await updateHighScoreApi(score);
                if (result.isNewHighScore) {
                    setIsNewHighScore(true);
                    updateLeaderboardApi(score);
                }
            } catch (error) {
                console.error("Failed to save high score:", error);
            }
        }
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
                            <button onClick={resetGame}>Restart</button>
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
};

export default Board;