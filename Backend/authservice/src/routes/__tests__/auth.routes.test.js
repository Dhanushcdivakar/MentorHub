import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import * as authService from "../../services/auth.service.js";

// Mock the auth service methods
vi.mock("../../services/auth.service.js");

describe("Auth Routes - POST /api/auth/register", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return 201 and user object on successful registration", async () => {
    const validBody = {
      name: "John Doe",
      email: "john@example.com",
      password: "Password123!", // meets validation: 1 uppercase, 1 lowercase, 1 special char, min 6 chars
      role: "student",
    };

    const serviceResponse = {
      _id: "user_id_john",
      name: "John Doe",
      email: "john@example.com",
      role: "student",
    };

    vi.mocked(authService.registerUser).mockResolvedValue(serviceResponse);

    const response = await request(app)
      .post("/api/auth/register")
      .send(validBody);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("User registered successfully");
    expect(response.body.data).toEqual(serviceResponse);
    expect(authService.registerUser).toHaveBeenCalledWith({
      name: validBody.name,
      email: validBody.email,
      password: validBody.password,
      role: validBody.role,
    });
  });

  it("should return 400 when validation fails (e.g. missing name)", async () => {
    const invalidBody = {
      email: "john@example.com",
      password: "Password123!",
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(invalidBody);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(authService.registerUser).not.toHaveBeenCalled();
  });

  it("should return 400 when password validation fails", async () => {
    const invalidBody = {
      name: "John Doe",
      email: "john@example.com",
      password: "123", // too short, no uppercase, no special char
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(invalidBody);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(authService.registerUser).not.toHaveBeenCalled();
  });
});

describe("Auth Routes - POST /api/auth/login", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return 200 and access/refresh tokens on successful login", async () => {
    const validBody = {
      email: "john@example.com",
      password: "Password123!",
    };

    const serviceResponse = {
      accessToken: "mocked_access_token",
      refreshToken: "mocked_refresh_token",
      user: {
        id: "user_id_john",
        name: "John Doe",
        email: "john@example.com",
        role: "student",
      },
    };

    vi.mocked(authService.loginUser).mockResolvedValue(serviceResponse);

    const response = await request(app)
      .post("/api/auth/login")
      .send(validBody);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.data).toEqual(serviceResponse);
    expect(authService.loginUser).toHaveBeenCalledWith(validBody.email, validBody.password);
  });

  it("should return 400 when validation fails (e.g. invalid email format)", async () => {
    const invalidBody = {
      email: "not-an-email",
      password: "Password123!",
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(invalidBody);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(authService.loginUser).not.toHaveBeenCalled();
  });
});
