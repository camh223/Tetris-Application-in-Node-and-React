import React, { JSX } from 'react';
import Board from '../components/Board';

function GamePage(): JSX.Element {
    return (
    <div style={{ padding: '2rem' }}>
        <Board />
    </div>
    );
}

export default GamePage;