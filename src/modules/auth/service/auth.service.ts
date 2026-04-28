import { BaseService } from "@/config/service/base.service";
import {
  Auth,
  CreateAuthDto,
  UpdateAuthDto
} from "../types/auth.types";

export class AuthService extends BaseService<
  Auth,
  CreateAuthDto,
  UpdateAuthDto
> {
  protected resourcePath = "/auth";
}

export const authService = new AuthService();