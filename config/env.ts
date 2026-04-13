/**
 * Single source of truth cho tất cả environment variables.
 *
 * Thiết kế:
 *   - ENV là nơi DUY NHẤT cần chỉnh khi thêm/sửa biến env
 *   - buildDefine() tự động derive từ ENV → dùng trong config/config.ts
 *   - env (lowercase) là object đã unwrap để dùng trong app code
 *
 * ─── Khi thêm biến env mới, CHỈ cần thêm 1 dòng vào ENV: ─────────────────────
 *
 *   // trong nhóm phù hợp bên dưới:
 *   newFlag: eBool("UMI_APP_NEW_FLAG", "false", process.env.UMI_APP_NEW_FLAG),
 *
 *   // rồi dùng ngay trong app code:
 *   import { env } from "../../config/env";
 *   if (env.featureFlags.newFlag) { ... }
 *
 * Không cần sửa thêm bất kỳ chỗ nào khác.
 *
 * ─── Tại sao phải dùng literal process.env.UMI_APP_XXX? ───────────────────────
 * Bundler (Webpack/Turbopack) thay thế tĩnh tại compile time.
 * Bracket notation động như process.env[key] sẽ KHÔNG được replace → undefined.
 * Vì vậy mỗi entry trong ENV phải truyền process.env.* trực tiếp dưới dạng literal.
 *
 * ─── Tại sao cần buildDefine()? ───────────────────────────────────────────────
 * Bundler utoopack (Turbopack) KHÔNG tự động inject UMI_APP_* vào browser bundle
 * như Webpack's DefinePlugin. buildDefine() walk ENV tree để extract define{}
 * và được spread vào config.ts — tự động cập nhật khi thêm entry vào ENV.
 */

// ─── Entry factory ────────────────────────────────────────────────────────────

interface EnvEntry<T> {
  /** Giá trị đã được resolve (process.env hoặc fallback về default) */
  value: T;
  /** Tên biến trong .env, dùng để buildDefine() tạo define{} */
  envKey: string;
  /** Giá trị mặc định dạng string như trong .env */
  rawDefault: string;
}

/** Tạo entry string */
const e = (
  envKey: string,
  rawDefault: string,
  resolved: string | undefined
): EnvEntry<string> => ({
  value: resolved || rawDefault,
  envKey,
  rawDefault,
});

/** Tạo entry number */
const eNum = (
  envKey: string,
  rawDefault: string,
  resolved: string | undefined
): EnvEntry<number> => ({
  value: resolved ? Number(resolved) : Number(rawDefault),
  envKey,
  rawDefault,
});

/** Tạo entry boolean — chấp nhận "true" hoặc "1" là true */
const eBool = (
  envKey: string,
  rawDefault: string,
  resolved: string | undefined
): EnvEntry<boolean> => ({
  value: resolved === "true" || resolved === "1",
  envKey,
  rawDefault,
});

// ─── ENV — source of truth duy nhất ──────────────────────────────────────────

/**
 * Tất cả giá trị env của app, có type safety và fallback về default.
 *
 * Dùng trực tiếp trong app code:
 * @example
 * import { ENV } from "../../config/env";
 * const fullUrl = `${ENV.api.baseUrl}${path}`;
 */
export const ENV = {
  // ── App ────────────────────────────────────────────────────────────────────
  app: {
    name: e("UMI_APP_NAME", "Ant Design Pro", process.env.UMI_APP_NAME),
    version: e("UMI_APP_VERSION", "1.0.0", process.env.UMI_APP_VERSION),
    locale: e("UMI_APP_LOCALE", "en-US", process.env.UMI_APP_LOCALE),
    fallbackLocale: e(
      "UMI_APP_FALLBACK_LOCALE",
      "zh-CN",
      process.env.UMI_APP_FALLBACK_LOCALE
    ),
  },

  // ── API ────────────────────────────────────────────────────────────────────
  api: {
    baseUrl: e("UMI_APP_API_URL", "/api", process.env.UMI_APP_API_URL),
    timeout: eNum(
      "UMI_APP_API_TIMEOUT",
      "30000",
      process.env.UMI_APP_API_TIMEOUT
    ),
  },

  // ── Storage ────────────────────────────────────────────────────────────────
  storage: {
    prefix: e(
      "UMI_APP_STORAGE_PREFIX",
      "antd_pro_",
      process.env.UMI_APP_STORAGE_PREFIX
    ),
  },

  // ── Feature Flags ──────────────────────────────────────────────────────────
  featureFlags: {
    enableAnalytics: eBool(
      "UMI_APP_ENABLE_ANALYTICS",
      "false",
      process.env.UMI_APP_ENABLE_ANALYTICS
    ),
    enableDebug: eBool(
      "UMI_APP_ENABLE_DEBUG",
      "false",
      process.env.UMI_APP_ENABLE_DEBUG
    ),
  },
} as const;

// ─── Type helpers ─────────────────────────────────────────────────────────────

// ─── Resolved env (Browser) ───────────────────────────────────────────────────

/** Extract kiểu value từ toàn bộ ENV tree, bỏ đi metadata envKey/rawDefault */
type ResolvedEnv<T> = T extends EnvEntry<infer V>
  ? V
  : T extends object
  ? { [K in keyof T]: ResolvedEnv<T[K]> }
  : T;

/** Kiểu của env object sau khi unwrap */
export type AppEnv = ResolvedEnv<typeof ENV>;

/**
 * Walk ENV tree và unwrap mỗi EnvEntry thành `.value` thuần.
 * Kết quả là object plain, không còn metadata envKey/rawDefault.
 */
function resolveEnv<T>(node: T): ResolvedEnv<T> {
  if (node === null || typeof node !== "object") return node as ResolvedEnv<T>;
  const obj = node as Record<string, unknown>;
  if ("envKey" in obj && "value" in obj) {
    return obj.value as ResolvedEnv<T>;
  }
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = resolveEnv(v);
  }
  return result as ResolvedEnv<T>;
}

/**
 * Object env đã unwrap, dùng trực tiếp trong app code.
 * Mỗi field là giá trị thuần (string / number / boolean), không còn metadata.
 *
 * @example
 * import { env } from "../../config/env";
 * const fullUrl = `${env.api.baseUrl}${path}`;
 * if (env.featureFlags.enableDebug) console.log(...);
 */
export const env: AppEnv = resolveEnv(ENV);

// ─── Build-time helper (Node.js only) ─────────────────────────────────────────

/**
 * Dùng trong config/config.ts để tạo define{} cho bundler.
 *
 * Tự động walk toàn bộ ENV tree và extract { envKey → process.env value }.
 * Khi thêm entry mới vào ENV, define{} tự động có ngay — không cần sửa thêm.
 *
 * @example
 * // config/config.ts
 * define: {
 *   "process.env.CI": process.env.CI,
 *   ...buildDefine(),
 * }
 */
export function buildDefine(): Record<string, string | undefined> {
  const define: Record<string, string | undefined> = {};

  const walk = (node: unknown): void => {
    if (node === null || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    if ("envKey" in obj && "rawDefault" in obj) {
      // Đây là EnvEntry — extract envKey và đọc từ process.env của Node
      const key = obj.envKey as string;
      define[`process.env.${key}`] = process.env[key];
    } else {
      for (const child of Object.values(obj)) walk(child);
    }
  };

  walk(ENV);
  return define;
}
