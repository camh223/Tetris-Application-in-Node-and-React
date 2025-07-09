const request = require("supertest");
const app = require(".../server/server");
const mongoose = require("mongoose");

describe("GET /api/auth/leaderboard", () => {
    beforeAll(async () => {

    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it("should return a leaderboard array", async() => {
        const res = await request(app).get("/api/auth/leaderboard");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.leaderboard)).toBe(true);
    })
})