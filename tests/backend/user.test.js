const request = require("supertest");
const app = require(".../server/server");

describe("High Score & Leaderboard Routes", () => {
    let token;

    beforeEach(async () => {
        const res = await request(app).post("/api/auth/register").send({
            username: "player1",
            email: "player1@example.com",
            password: "password123",
        });
        token = res.body.token;
    });

    it("should update high score if score is higher", async () => {
        const res = await request(app)
            .put("/api/users/update-highscore")
            .set("Authorization", `Bearer ${token}`)
            .send({ score: 100 });

        expect(res.statusCode).toBe(200);
        expect(res.body.highScore).toBe(100);
        expect(res.body.isNewHighScore).toBe(true);
    });

    it("should NOT update high score if new score is lower", async () => {
        await request(app)
            .put("/api/users/update-highscore")
            .set("Authorization", `Bearer ${token}`)
            .send({ score: 150 });

        const res = await request(app)
            .put("/api/users/update-highscore")
            .set("Authorization", `Bearer ${token}`)
            .send({ score: 50 });

        expect(res.statusCode).toBe(200);
        expect(res.body.isNewHighScore).toBe(false);
        expect(res.body.highScore).toBe(150);
    });

    it("should return top 10 users in leaderboard", async () => {
        const users = [
            { username: "alice", email: "alice@example.com", password: "pass", score: 200},
            { username: "bob", email: "bob@example.com", password: "pass", score: 180 },
            { username: "carol", email: "carol@example.com", password: "pass", score: 220 },
        ];

        for (const u of users) {
            const reg = await request(app).post("/api/users/register").send(u);
            await request(app)
                .put("/api/users/update-highscore")
                .set("Authorization", `Bearer ${reg.body.token}`)
                .send({ score: u.score });
        }

        const res = await request(app).get("/api/users/leaderboard");s

        expect(res.statusCode).toBe(200);
        expect(res.body.leaderboard.length).toBeGreaterThanOrEqual(3);
        expect(res.body.leaderboard[0].highScore).toBeGreaterThanOrEqual(res.body.leaderboard[1].highScore);
    });
});