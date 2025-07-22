import axios from '../../api/axios';
import { User } from '../../context/AuthContext';

export default class ScoreUploader {

    private isNewHighScore: boolean = false;

    constructor(private user: User | null, private setUser: (user: User) => void) {}

    public getIsNewHighScore(): boolean {
        return this.isNewHighScore;
    }

    public checkAndSaveHighScore = async (score: number) => {
        if (!this.user) return;
        if (score > (this.user.highScore ?? 0)) {
            try {
                const result = await this.updateHighScoreApi(score);
                if (result.isNewHighScore) {
                    this.isNewHighScore = true;
                    this.updateLeaderboardApi(score);
                }
            } catch (error) {
                console.error("Failed to save high score:", error);
            }
        }
    };

    private updateHighScoreApi = async (newScore: number) => {
        if (!this.user) return;
        try {
            const res = await axios.post(
                '/users/highscore',
                { score: newScore },
                { withCredentials: true }
            );
            this.setUser({ ...this.user, highScore: newScore });
            return res.data;
        } catch (error) {
            console.error("Failed to update high score:", error);
            throw error;
        }
    };

    private updateLeaderboardApi = async (newScore: number) => {
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
}