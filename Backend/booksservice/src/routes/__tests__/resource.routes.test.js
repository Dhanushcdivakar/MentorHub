import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import * as resourceService from "../../services/resource.service.js";
import jwt from "jsonwebtoken";

// Mock services & jwt verify
vi.mock("../../services/resource.service.js");
vi.mock("jsonwebtoken");

describe("Resource Routes - Authorization & Ownership", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const generateHeaders = (tokenVal = "mocked_jwt_token") => ({
    Authorization: `Bearer ${tokenVal}`,
  });

  it("should block non-mentors/non-admins (e.g. students) from updating resources", async () => {
    // Mock token decoding for a student
    vi.mocked(jwt.verify).mockReturnValue({
      id: "student_123",
      role: "STUDENT",
    });

    const response = await request(app)
      .put("/api/resources/res_id_1")
      .set(generateHeaders())
      .send({ title: "New Title" });

    // Expect 403 Forbidden because route role restriction allows only ADMIN / MENTOR
    expect(response.status).toBe(403);
    expect(resourceService.updateResource).not.toHaveBeenCalled();
  });

  it("should allow a mentor to update their own resource", async () => {
    const mentorId = "mentor_123";
    vi.mocked(jwt.verify).mockReturnValue({
      id: mentorId,
      role: "MENTOR",
    });

    const updatedResource = { _id: "res_id_1", title: "New Title", mentorId };
    vi.mocked(resourceService.updateResource).mockResolvedValue(updatedResource);

    const response = await request(app)
      .put("/api/resources/res_id_1")
      .set(generateHeaders())
      .send({ title: "New Title" });

    expect(response.status).toBe(200);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(updatedResource);
    expect(resourceService.updateResource).toHaveBeenCalledWith(
      "res_id_1",
      mentorId,
      "MENTOR",
      expect.objectContaining({ title: "New Title" }),
      undefined
    );
  });

  it("should block a mentor from updating another mentor's resource", async () => {
    const mentorId = "mentor_123";
    vi.mocked(jwt.verify).mockReturnValue({
      id: mentorId,
      role: "MENTOR",
    });

    // Mock service layer to throw a 403 forbidden error on ownership check
    vi.mocked(resourceService.updateResource).mockRejectedValue({
      statusCode: 403,
      message: "You do not have permission to update this resource.",
    });

    const response = await request(app)
      .put("/api/resources/res_id_1")
      .set(generateHeaders())
      .send({ title: "New Title" });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("should allow admins to update any resource", async () => {
    vi.mocked(jwt.verify).mockReturnValue({
      id: "admin_123",
      role: "ADMIN",
    });

    const updatedResource = { _id: "res_id_1", title: "New Title", mentorId: "mentor_123" };
    vi.mocked(resourceService.updateResource).mockResolvedValue(updatedResource);

    const response = await request(app)
      .put("/api/resources/res_id_1")
      .set(generateHeaders())
      .send({ title: "New Title" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(resourceService.updateResource).toHaveBeenCalledWith(
      "res_id_1",
      "admin_123",
      "ADMIN",
      expect.objectContaining({ title: "New Title" }),
      undefined
    );
  });
});
