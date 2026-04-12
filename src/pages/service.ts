import { request } from "@umijs/max";

export async function fakeSubmitForm(params: Record<string, any>) {
  return request("/api/form", { method: "POST", data: params });
}

export async function queryAdvancedProfile() {
  return request("/api/profile/advanced");
}

export async function queryBasicProfile() {
  return request("/api/profile/basic");
}

export async function queryCurrent(options?: Record<string, any>) {
  return request("/api/current", { ...options });
}

export async function queryFakeList(params: Record<string, any>) {
  return request("/api/fake-list", { params });
}

export async function fakeChartData() {
  return request("/api/fake-chart-data");
}

export async function queryActivities() {
  return request("/api/activities");
}

export async function queryProjectNotice() {
  return request("/api/project/notice");
}

export async function queryTags() {
  return request("/api/tags");
}

export async function fakeRegister(params: Record<string, any>) {
  return request("/api/register", { method: "POST", data: params });
}
