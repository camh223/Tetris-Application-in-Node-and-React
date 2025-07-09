import React, { Component } from 'react';
import { AuthContextType, useAuth } from '../context/AuthContext';
import { ShapeBase, getRandomShape } from '../models/Shape';
import './Board.css';

type Shape = number[][];
type Block = { shape: Shape; type: string };
type Position = { row: number; col: number };

type BoardState = {
    grid: number[][];
    currentShape: Block;
    nextShape: Block;
    position: Position;
    isGameOver: boolean;
    score: number;
    linesCleared: number;
    level: number;
    isNewHighScore: boolean;
}

