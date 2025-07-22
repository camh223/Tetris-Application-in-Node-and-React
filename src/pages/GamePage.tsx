import { JSX } from 'react';
import RenderBoard from '../components/RenderGame';

function GamePage(): JSX.Element {
    return (
    <div style={{ padding: '2rem' }}>
        <RenderBoard />
    </div>
    );
}

export default GamePage;