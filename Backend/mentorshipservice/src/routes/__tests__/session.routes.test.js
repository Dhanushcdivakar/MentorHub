import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import * as sessionService from "../../services/session.service.js";

// Mock the services
vi.mock("../../services/session.service.js");
vi.mock("../../services/event.service.js");

describe("Session Booking Routes - Authorization & Ownership", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should block a mentor from booking a session", async () => {
    vi.mocked(sessionService.createNewSession).mockRejectedValue({
      statusCode: 403,
      message: "Only students can create sessions",
    });

    const response = await request(app)
      .post("/api/sessions")
      .set("x-user-id", "mentor_123")
      .set("x-user-role", "mentor")
      .send({
        mentorId: "mentor_abc",
        scheduledAt: new Date().toISOString(),
        durationInMinutes: 60,
        agenda: "Discuss systems",
      });

    expect(response.status).toBe(403);
    expect(sessionService.createNewSession).toHaveBeenCalled();
  });

  it("should allow a student to book a session successfully", async () => {
    const sessionData = {
      _id: "session_123",
      mentorId: "mentor_abc",
      studentId: "student_123",
      scheduledAt: new Date().toISOString(),
      durationInMinutes: 60,
      agenda: "Discuss systems",
      status: "pending",
    };

    vi.mocked(sessionService.createNewSession).mockResolvedValue(sessionData);

    const response = await request(app)
      .post("/api/sessions")
      .set("x-user-id", "student_123")
      .set("x-user-role", "student")
      .send({
        mentorId: "mentor_abc",
        scheduledAt: sessionData.scheduledAt,
        durationInMinutes: 60,
        agenda: "Discuss systems",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(sessionData);
  });

  it("should block an unauthorized user from viewing session details", async () => {
    const sessionData = {
      _id: "session_123",
      studentId: "student_123",
      mentorId: "mentor_abc",
    };

    vi.mocked(sessionService.getSessionById).mockResolvedValue(sessionData);

    const response = await request(app)
      .get("/api/sessions/session_123")
      .set("x-user-id", "unrelated_user")
      .set("x-user-role", "student");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Unauthorized. You do not own this session.");
  });

  it("should allow the booked student to view session details", async () => {
    const sessionData = {
      _id: "session_123",
      studentId: "student_123",
      mentorId: "mentor_abc",
    };

    vi.mocked(sessionService.getSessionById).mockResolvedValue(sessionData);

    const response = await request(app)
      .get("/api/sessions/session_123")
      .set("x-user-id", "student_123")
      .set("x-user-role", "student");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(sessionData);
  });

  it("should allow the booked mentor to view session details", async () => {
    const sessionData = {
      _id: "session_123",
      studentId: "student_123",
      mentorId: "mentor_abc",
    };

    vi.mocked(sessionService.getSessionById).mockResolvedValue(sessionData);

    const response = await request(app)
      .get("/api/sessions/session_123")
      .set("x-user-id", "mentor_abc")
      .set("x-user-role", "mentor");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(sessionData);
  });
});
