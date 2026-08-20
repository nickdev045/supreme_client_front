import { z } from "zod";

export const USER_PASSWORD_MIN_LENGTH = 8;
export const USER_PASSWORD_MAX_LENGTH = 128;

export const USER_PASSWORD_PATTERN =
  "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,128}";

export const secureUserPasswordSchema = z
  .string()
  .min(USER_PASSWORD_MIN_LENGTH)
  .max(USER_PASSWORD_MAX_LENGTH)
  .regex(/[a-z]/)
  .regex(/[A-Z]/)
  .regex(/\d/)
  .regex(/[^A-Za-z0-9]/);
