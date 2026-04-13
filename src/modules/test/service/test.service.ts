import { BaseService } from "@/config/service/base.service";
import {
  Test,
  CreateTestDto,
  UpdateTestDto
} from "../types/test.types";

export class TestService extends BaseService<
  Test,
  CreateTestDto,
  UpdateTestDto
> {
  protected resourcePath = "/test";
}

export const testService = new TestService();
