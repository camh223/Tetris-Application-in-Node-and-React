const request = require("supertest");
const mongoose = require("mongoose");
const app = require(".../server/server");
const User = require(".../server/models/User");

const TEST_DB_URI = process.env.TEST_DB_URI || "mongodb://127.0.0.1:27017/tetris_test";

beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
    await User.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Auth Routes", () => {
    it("should register a new user", async () => {
        const res = await request(app).post("/api/auth/register").send({
            username: "testuser",
            email: "test@example.com",
            password: "password123",
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user.username).toBe("testuser");
    });

    it("should not register with missing fields", async () => {
        const res = await request(app).post("/api/auth/register").send({
            email: "no-username@example.com",
            password: "pass",
        });

        expect(res.statusCode).toBe(400);
    });

    it("should login with valid credentials", async () => {
        await request(app).post("/api/auth/register").send({
            username: "testuser",
            email: "test@example.com",
            password: "password123",
        });

        const res = await request(app).post("/api/auth/login").send({
            email: "test@example.com",
            password: "password123",
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
    });

    it("should reject login with invalid credentials", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "fake@example.com",
            password: "wrongpass",
        });

        expect(res.statusCode).toBe(401);
    });

    it("should get user info with valid token", async () => {
        const register = await request(app).post("/api/auth/register").send({
            username: "testuser",
            email: "test@example.com",
            password: "password123",
        });

        const token = register.body.token;

        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.user).toHaveProperty("username", "testuser");
    });
});