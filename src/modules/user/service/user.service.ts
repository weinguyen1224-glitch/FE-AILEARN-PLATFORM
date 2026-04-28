import { BaseService } from "@/config/service/base.service";
import { CreateUserDto, UpdateUserDto, User } from "../types/user.types";

export class UserService extends BaseService<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  protected resourcePath = "/user";
}

export const userService = new UserService();
