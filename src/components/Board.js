import React from 'react';
import { useState, useEffect, useRef } from 'react';
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
    return SHAPES[randKey];
};

const rotate = (shape) => {
    return shape[0].map((_, colIndex) =>
    shape.map(row => row[colIndex]).reverse()
    );
};

function Board() {

    const rows = 20;
    const cols = 10;

    const [grid, setGrid] = useState(() => 
        Array.from({ length: rows }, () => Array(cols).fill(0))
    );

    const [shape, setShape] = useState(getRandomShape());

    const shapeRef = useRef(shape);

    const [position, setPosition] = useState({ row: 0, col: 4 });

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
        const clearedGrid = clearFullLines(newGrid);
        setGrid(clearedGrid);
    };

    const clearFullLines = (gridToCheck) => {
        const newGrid = gridToCheck.filter((row) => row.some((cell) => cell === 0));
        const linesCleared = rows - newGrid.length;

        while (newGrid.length < rows) {
            newGrid.unshift(Array(cols).fill(0));
        }

        return newGrid;
    };

    useEffect(() => {
        shapeRef.current = shape;
    }, [shape]);

    // Shape Control
    useEffect(() => {
        const handleKeyDown = (e) => {

            if (e.key === 'ArrowUp') {
                const rotated = rotate(shapeRef.current);

                const kicks = [0, -1, 1, -2, 2];
                for (const offset of kicks) {
                    const testCol = position.col + offset;
                    console.log("Trying to kick with offset", offset, "-> col: ", testCol);
                    if (canMoveTo(position.row, testCol, rotated)) {
                        setShape(() => {
                            shapeRef.current = rotated;
                            return rotated;
                        });

                        setPosition(pos => ({ ...pos, col: pos.col + offset }));
                        return;
                    }
                }

                return;
            }

            setPosition((prev) => {
                const next = { ...prev };

                if (e.key === 'ArrowLeft') next.col -= 1;
                if (e.key === 'ArrowRight') next.col += 1;
                if (e.key === 'ArrowDown') next.row += 1;

                if (canMoveTo(next.row, next.col)) {
                    return next;
                } else if (e.key === 'ArrowDown') {
                    mergeShapeIntoGridAt(prev, shapeRef.current);
                    setShape(getRandomShape());
                    return { row: 0, col: 4};
                }
                
                return prev;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [grid]);

    
    // Gravity Effect
    useEffect(() => {
        const interval = setInterval(() => {
            setPosition((prev) => { 
                const next = { ...prev, row: prev.row + 1 };

                if (canMoveTo(next.row, next.col)) {
                    return next;
                } else {
                    mergeShapeIntoGridAt(prev, shapeRef.current);
                    setShape(getRandomShape());
                    return { row: 0, col: 4};
                }
            });
        }, 500);

        return () => clearInterval(interval);
    }, [grid]);

    return (
        <div className="board">
            {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                    const relativeRow = rowIndex - position.row;
                    const relativeCol = colIndex - position.col;

                    const inShapeBounds =
                        relativeRow >= 0 &&
                        relativeRow < shape.length &&
                        relativeCol >= 0 &&
                        relativeCol < shape[0].length;

                    const isShapeCell =
                        inShapeBounds && shape[relativeRow][relativeCol] === 1;

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
        </div>
    );
}

export default Board;
