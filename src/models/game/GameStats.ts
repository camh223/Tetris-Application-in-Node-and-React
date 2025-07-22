const BASE_POINTS = [0, 100, 300, 500, 800];

export default class GameStats {
    private level: number = 0;
    private score: number = 0;
    private linesCleared: number = 0;

    public getLevel(): number {
        return this.level;
    }

    public getScore(): number {
        return this.score;
    }

    public getLinesCleared(): number {
        return this.linesCleared
    }

    public updateLevel() {
        this.level = Math.floor(this.linesCleared / 10);
    }

    private calculateScore(linesCleared: number): number {
        const levelMultiplier = this.level + 1;
        return (BASE_POINTS[linesCleared] || 0) * levelMultiplier;
    }

    public updateScore(linesCleared: number) {
        const newPoints = this.calculateScore(linesCleared);
        this.score += newPoints;
    }

    public updateLinesCleared(numLinesCleared: number) {
        this.linesCleared += numLinesCleared;
    }
}