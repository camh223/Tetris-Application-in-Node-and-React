import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './Board.css'

const SHAPES = {
    0: [
        [1, 1],
        [1, 1]
    ],
    I: [
        [1, 1, 1, 1]
    ],
    L: [
        [1, 0],
        [1, 0],
        [1, 1]
    ],
    J: [
        [0, 1],
        [0, 1],
        [1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],
    T: [
        [1, 1, 1],
        [0, 1, 0]
    ]
};

const getRandomShape = () => {
    const keys = Object.keys(SHAPES);
    const randKey = keys[Math.floor(Math.random() * keys.length)];
    return { shape: SHAPES[randKey], type: randKey };
};

const rotate = (shape) => {
    return shape[0].map((_, colIndex) =>
    shape.map(row => row[colIndex]).reverse()
    );
};

function Board() {
    const { user, updateHighScore } = useAuth();

    // Define board shape
    const rows = 20;
    const cols = 10;


    // Define states for game
    const [grid, setGrid] = useState(() => 
        Array.from({ length: rows }, () => Array(cols).fill(0))
    );
    const [currentShape, setCurrentShape] = useState(() => getRandomShape());
    const [nextShape, setNextShape] = useState(() => getRandomShape());
    const [position, setPosition] = useState({ row: 0, col: 4 });
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [linesCleared, setLinesCleared] = useState(0);
    const [level, setLevel] = useState(0);
    const [isNewHighScore, setIsNewHighScore] = useState(false);
    const baseInterval = 500;

    // Refs
    const shapeRef = useRef(currentShape.shape);
    const hasMergedRef = useRef(false);

    const canMoveTo = (nextRow, nextCol, shapeToCheck = shapeRef.current) => {
        const shapeHeight = shapeToCheck.length;
        const shapeWidth = shapeToCheck[0].length;

        if (
            nextRow < 0 || nextRow + shapeHeight > rows ||
            nextCol < 0 || nextCol + shapeWidth > cols
        ) {
            return false;
        }

        for (let r=0; r < shapeHeight; r++) {
            for (let c=0; c < shapeWidth; c++) {
                if (shapeToCheck[r][c] === 1 && grid[nextRow + r][nextCol + c] === 1) {
                    return false;
                }
            }
        }
        return true;
    };

    const mergeShapeIntoGridAt = (pos, shapeToMerge = shapeRef.current) => {
        console.log("Merging shape into grid.");
        const newGrid = grid.map((row) => [...row]);

        for (let r = 0; r < shapeToMerge.length; r++) {
            for (let c = 0; c < shapeToMerge[0].length; c++) {
                if (shapeToMerge[r][c] === 1) {
                    const gridRow = pos.row + r;
                    const gridCol = pos.col + c;
                    if (gridRow >= 0 && gridRow < rows && gridCol >= 0 && gridCol < cols) {
                        newGrid[gridRow][gridCol] = 1;
                    }
                }
            }
        }
        const { newGrid: clearedGrid, linesRemoved } = clearFullLines(newGrid);

        console.log("Lines Cleared: ", linesCleared);

        if (linesRemoved > 0) {
            console.log("Clearing Lines");
            console.log("Num Lines Removed: ", linesRemoved);
            setScore(prev => prev + linesRemoved * 100);
            setLinesCleared(prev => {
                const updated = prev + linesRemoved;
            
                const newLevel = Math.floor(updated / 10);
                setLevel(newLevel);
            
                return updated;
            });
        }

        console.log("Lines Cleared: ", linesCleared);

        setGrid(clearedGrid);
        console.log("Shape Merged");
    };


    // Row clearing functionality
    const clearFullLines = (gridToCheck) => {
        const newGrid = gridToCheck.filter((row) => row.some((cell) => cell === 0));
        const linesRemoved = rows - newGrid.length;

        while (newGrid.length < rows) {
            newGrid.unshift(Array(cols).fill(0));
        }

        return { newGrid, linesRemoved };
    };

    const handleGameOver = async () => {
        if (user && score > 0) {
            try {
                const result = await updateHighScore(score);
                setIsNewHighScore(result.isNewHighScore);
            } catch (error) {
                console.error('Failed to update high score:', error);
            }
        }
    };

    // Handle game over and high score update
    useEffect(() => {
        if (isGameOver && user && score > 0) {
            handleGameOver();
        }
    }, [isGameOver, user, score]);

    useEffect(() => {
        shapeRef.current = currentShape.shape;
    }, [currentShape]);

    // Handle Key Inputs
    useEffect(() => {
        const handleKeyDown = (e) => {
            console.log("Handling Key Press");
            if (isGameOver) return;

            if (e.key === 'ArrowUp') {
                const rotated = rotate(shapeRef.current);

                const kicks = [0, -1, 1, -2, 2];
                for (const offset of kicks) {
                    const testCol = position.col + offset;
                    console.log("Trying to kick with offset", offset, "-> col: ", testCol);
                    if (canMoveTo(position.row, testCol, rotated)) {
                        shapeRef.current = rotated;

                        setCurrentShape(prev => ({
                            ...prev,
                            shape: rotated
                        }));

                        setPosition(pos => ({ ...pos, col: pos.col + offset }));
                        return;
                    }
                }

                return;
            }

            if (e.key === 'ArrowDown') {
                const next = { ...position, row: position.row + 1};

                if (canMoveTo(next.row, next.col)) {
                    hasMergedRef.current = false;
                    setPosition(next);
                } else if (!hasMergedRef.current) {
                    hasMergedRef.current = true;
                    mergeShapeIntoGridAt(position, shapeRef.current);

                    const newShape = getRandomShape();
                    const spawnPosition = { row: 0, col: 4};

                    if (!canMoveTo(spawnPosition.row, spawnPosition.col, newShape.shape)) {
                        setIsGameOver(true);
                        return;
                    }

                    setCurrentShape(nextShape);
                    shapeRef.current = nextShape.shape;
                    setNextShape(newShape);
                    setPosition(spawnPosition);
                }
                return;
            }

            setPosition((prev) => {
                const next = { ...prev };

                if (e.key === 'ArrowLeft') next.col -= 1;
                if (e.key === 'ArrowRight') next.col += 1;

                if (canMoveTo(next.row, next.col)) {
                    hasMergedRef.current = false;
                    return next;
                }
                
                return prev;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [grid, position, isGameOver, nextShape]);

    
    // Gravity Effect
    useEffect(() => {
        const speed = baseInterval * Math.pow(0.9, level);

        const interval = setInterval(() => {
            if (isGameOver) return; 

            const next = { ...position, row: position.row + 1 };

            if (canMoveTo(next.row, next.col)) {
                hasMergedRef.current = false;
                setPosition(next);
            } else if (!hasMergedRef.current) {
                hasMergedRef.current = true;
                mergeShapeIntoGridAt(position, shapeRef.current);
                // Spawn new shape
                const newShape = getRandomShape();
                const spawnPosition = { row: 0, col: 4};

                if(!canMoveTo(spawnPosition.row, spawnPosition.col, newShape.shape)) {
                    setIsGameOver(true);
                    return;
                }

                setCurrentShape(nextShape);
                shapeRef.current = nextShape.shape;
                setNextShape(newShape);
                setPosition(spawnPosition);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [position, grid, isGameOver, nextShape]);

    const resetGame = () => {
        setGrid(Array.from({ length: rows }, () => Array(cols).fill(0)));
        setCurrentShape(nextShape);
        shapeRef.current = nextShape.shape;
        setNextShape(getRandomShape());
        setPosition({ row: 0, col: 4 });
        setIsGameOver(false);
        setScore(0);
        setLinesCleared(0);
        setLevel(0);
        setIsNewHighScore(false);
    };

    return (
        <div className="game-container">
            <div className="game-board">
                {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                        const relativeRow = rowIndex - position.row;
                        const relativeCol = colIndex - position.col;

                        const inShapeBounds =
                            relativeRow >= 0 &&
                            relativeRow < currentShape.shape.length &&
                            relativeCol >= 0 &&
                            relativeCol < currentShape.shape[0].length;

                        const isShapeCell =
                            inShapeBounds && currentShape.shape[relativeRow][relativeCol] === 1;

                        const isLockedCell = grid[rowIndex][colIndex] === 1;

                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className="cell"
                                style={{
                                    backgroundColor: isShapeCell
                                        ? 'blue'
                                        : isLockedCell
                                        ? 'darkgray'
                                        : 'lightgray',
                                }}
                            />
                        );
                    })
                )}
                {isGameOver && (
                    <div className="game-over-overlay">
                        <div className="game-over-content">
                            <h1>Game Over</h1>
                            {isNewHighScore && (
                                <div className="new-high-score">
                                    <h2 style={{ color: 'gold' }}>New High Score!</h2>
                                </div>
                            )}
                            <p>Score: <span>{score}</span></p>
                            <p>Level: <span>{level}</span></p>
                            {user && (
                                <p>Your High Score: <span>{user.highScore}</span></p>
                            )}
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
                    <p> {level}</p>

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
                    {nextShape.shape.map((row, rowIndex) => (
                        <div key={rowIndex} className="next-shape-row">
                            {row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className="cell"
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: cell ? 'blue' : 'transparent',
                                        border: cell ? '1px solid #333' : 'none',
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

export default Board;
