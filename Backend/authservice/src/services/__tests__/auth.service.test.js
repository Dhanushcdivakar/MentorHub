import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerUser, loginUser } from "../auth.service.js";
import * as authRepo from "../../repositories/auth.repository.js";
import * as redisRepo from "../../repositories/redis.repository.js";
import * as userCreatedProducer from "../../producers/userCreated.producer.js";
import * as userLoginProducer from "../../producers/userLogin.producer.js";
import * as passwordUtil from "../../utils/password.util.js";
import * as tokenUtil from "../../utils/token.util.js";
import { AppError } from "../../utils/AppError.js";

// Mock the dependencies
vi.mock("../../repositories/auth.repository.js");
vi.mock("../../repositories/redis.repository.js");
vi.mock("../../producers/userCreated.producer.js");
vi.mock("../../producers/userLogin.producer.js");
vi.mock("../../utils/password.util.js");
vi.mock("../../utils/token.util.js");
vi.mock("../../utils/email.util.js");

describe("Auth Service - registerUser", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should successfully register a new user", async () => {
    const userData = { email: "test@example.com", password: "password123", name: "Test User" };
    const hashedPassword = "hashed_password123";
    const createdUser = { _id: "user_id_123", ...userData, password: hashedPassword };

    // Set up mock implementations
    vi.mocked(authRepo.findUserByEmail).mockResolvedValue(null);
    vi.mocked(passwordUtil.hashPassword).mockResolvedValue(hashedPassword);
    vi.mocked(authRepo.createUser).mockResolvedValue(createdUser);
    vi.mocked(userCreatedProducer.publishUserCreated).mockResolvedValue(true);

    const result = await registerUser(userData);

    expect(authRepo.findUserByEmail).toHaveBeenCalledWith(userData.email);
    expect(passwordUtil.hashPassword).toHaveBeenCalledWith(userData.password);
    expect(authRepo.createUser).toHaveBeenCalledWith({
      ...userData,
      password: hashedPassword,
    });
    expect(userCreatedProducer.publishUserCreated).toHaveBeenCalledWith(createdUser);
    expect(result).toEqual(createdUser);
  });

  it("should throw an error if the user already exists", async () => {
    const userData = { email: "existing@example.com", password: "password123" };
    vi.mocked(authRepo.findUserByEmail).mockResolvedValue({ _id: "some_id", email: userData.email });

    await expect(registerUser(userData)).rejects.toThrow(
      new AppError("User already exists", 409)
    );
  });
});

describe("Auth Service - loginUser", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should successfully login a user with correct credentials", async () => {
    const email = "test@example.com";
    const password = "password123";
    const user = { _id: "user_id_123", name: "Test User", email, password: "hashed_password", role: "student" };
    
    vi.mocked(authRepo.findUserByEmailWithPassword).mockResolvedValue(user);
    vi.mocked(passwordUtil.comparePassword).mockResolvedValue(true);
    vi.mocked(tokenUtil.generateAccessToken).mockReturnValue("access_token_jwt");
    vi.mocked(tokenUtil.generateRefreshToken).mockReturnValue("refresh_token_jwt");
    vi.mocked(passwordUtil.hashToken).mockResolvedValue("hashed_refresh_token");
    vi.mocked(redisRepo.saveRefreshToken).mockResolvedValue(true);
    vi.mocked(userLoginProducer.publishUserLogin).mockResolvedValue(true);

    const result = await loginUser(email, password);

    expect(authRepo.findUserByEmailWithPassword).toHaveBeenCalledWith(email);
    expect(passwordUtil.comparePassword).toHaveBeenCalledWith(password, user.password);
    expect(tokenUtil.generateAccessToken).toHaveBeenCalledWith({ id: user._id, role: user.role });
    expect(tokenUtil.generateRefreshToken).toHaveBeenCalledWith({ id: user._id });
    expect(redisRepo.saveRefreshToken).toHaveBeenCalledWith(user._id, "hashed_refresh_token");
    expect(userLoginProducer.publishUserLogin).toHaveBeenCalledWith(user);
    
    expect(result).toEqual({
      accessToken: "access_token_jwt",
      refreshToken: "refresh_token_jwt",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });

  it("should throw an error if the user is not found", async () => {
    vi.mocked(authRepo.findUserByEmailWithPassword).mockResolvedValue(null);

    await expect(loginUser("unknown@example.com", "password")).rejects.toThrow(
      new AppError("Invalid credentials", 401)
    );
  });

  it("should throw an error if the password does not match", async () => {
    const user = { _id: "user_id_123", email: "test@example.com", password: "hashed_password" };
    vi.mocked(authRepo.findUserByEmailWithPassword).mockResolvedValue(user);
    vi.mocked(passwordUtil.comparePassword).mockResolvedValue(false);

    await expect(loginUser("test@example.com", "wrong_password")).rejects.toThrow(
      new AppError("Invalid credentials", 401)
    );
  });
});
