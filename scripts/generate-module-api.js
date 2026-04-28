#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

/**
 * Mảng các field đã có trong BaseEntity để loại trừ
 */
const baseEntityFields = [
  "id",
  "ma",
  "stt",
  "createdAt",
  "updatedAt",
  "deletedAt",
];

/**
 * Hàm lấy cấu hình env
 */
function getApiUrl() {
  let apiUrl = process.env.UMI_APP_API_URL || "http://localhost:3000";
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/^UMI_APP_API_URL\s*=\s*(.*)$/m);
    if (match && match[1]) {
      apiUrl = match[1].trim().replace(/['"]/g, "");
    }
  }
  return apiUrl;
}

/**
 * Hàm fetch JSON API Schema
 */
async function fetchApiSchema(apiUrl) {
  const jsonUrl = apiUrl + "/api/json";
  console.log("\n⏳ Đang tải API Document từ: " + jsonUrl);
  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error("HTTP error! status: " + response.status);
    }
    const data = await response.json();
    console.log("✅ Đã tải xong API Document.");
    return data;
  } catch (error) {
    console.error("❌ Không thể tải API Document:", error.message);
    process.exit(1);
  }
}

/**
 * Hàm map OpenAPI type sang TypeScript type
 */
function mapTypeToTs(schemaProp, forEnumDetection) {
  if (!schemaProp) return "any";
  if (schemaProp.enum) {
    if (forEnumDetection) return "enum";
    return schemaProp.enum
      .map(function (e) {
        return '"' + e + '"';
      })
      .join(" | ");
  }
  var type = schemaProp.type;
  switch (type) {
    case "string":
      if (schemaProp.format === "date-time") return "Date | string";
      return "string";
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return mapTypeToTs(schemaProp.items, forEnumDetection) + "[]";
    case "object":
      return "Record<string, any>";
    default:
      if (schemaProp.$ref) return "any";
      return "any";
  }
}

/**
 * Hàm chuyển string sang PascalCase cho enum name
 */
function toPascalCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]/g, " ")
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
}

/**
 * Hàm tạo enum key từ value (loại bỏ dấu, space, special chars)
 */
function toEnumKey(value) {
  return value
    .normalize("NFD")
    .replace(/[̀-̿]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toUpperCase();
}

/**
 * Hàm hiển thị UI chọn fields trên Terminal
 */
function selectFieldsUI(fields) {
  return new Promise(function (resolve) {
    var currentIndex = 0;
    var selected = {};
    fields.forEach(function (f) {
      selected[f.name] = true;
    });

    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    var lineCount = fields.length + 5;

    function render() {
      // Xóa màn hình hoàn toàn và về home
      process.stdout.write("\x1B[2J"); // Xóa toàn bộ màn hình
      process.stdout.write("\x1B[H"); // Về vị trí home

      console.log("\n📋 Chọn các fields cho module (↑↓ di chuyển, Space chọn/bỏ, Enter xác nhận):\n");
      fields.forEach(function (field, index) {
        var isSelected = selected[field.name];
        var cursor = index === currentIndex ? "👉" : "  ";
        var checkbox = isSelected ? "[x]" : "[ ]";
        var reqStr = field.required ? "(required)" : "";
        var enumBadge = field.isEnum ? "🔖" : "";
        console.log(
          cursor +
            " " +
            checkbox +
            " " +
            field.name +
            ": " +
            field.tsType +
            " " +
            reqStr +
            " " +
            enumBadge
        );
      });
      console.log("\n  ↑↓ di chuyển | Space chọn/bỏ | Enter xác nhận");
    }

    render();

    var onKeypress = function (str, key) {
      if (key.name === "up") {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : fields.length - 1;
        render();
      } else if (key.name === "down") {
        currentIndex = currentIndex < fields.length - 1 ? currentIndex + 1 : 0;
        render();
      } else if (key.name === "space") {
        var currentField = fields[currentIndex];
        selected[currentField.name] = !selected[currentField.name];
        render();
      } else if (key.name === "return" || key.name === "enter") {
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.stdin.removeListener("keypress", onKeypress);
        rl.close();
        var resultFields = fields.filter(function (f) {
          return selected[f.name];
        });
        resolve(resultFields);
      } else if (key.name === "c" && key.ctrl) {
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.exit(0);
      }
    };

    process.stdin.on("keypress", onKeypress);
  });
}

/**
 * Hàm hỏi Yes/No trên CLI với checkbox UI
 */
function askYesNo(question) {
  return new Promise(function (resolve) {
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    var selected = true; // Default là Yes
    var lineCount = 5;

    function render() {
      // Xóa màn hình và di chuyển con trỏ về vị trí ban đầu
      process.stdout.write("\x1B[G"); // Về đầu dòng
      process.stdout.write("\x1B[J"); // Xóa từ vị trí con trỏ đến hết
      process.stdout.write("\x1B[" + lineCount + "A"); // Lên lineCount dòng
      process.stdout.write("\x1B[2J"); // Xóa màn hình
      process.stdout.write("\x1B[H"); // Về vị trí home

      // In nội dung
      console.log("\n".repeat(2));
      console.log(question + "\n");
      console.log("  " + (selected ? "👉 [x]" : "   [ ]") + " Có");
      console.log("  " + (selected ? "   [ ]" : "👉 [x]") + " Không");
      console.log("\n  ↑↓ để di chuyển, Enter để xác nhận");
    }

    render();

    var onKeypress = function (str, key) {
      // Ngăn không cho in ký tự điều khiển
      if (key.name === "up" || key.name === "down") {
        selected = !selected;
        render();
      } else if (key.name === "return" || key.name === "enter") {
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.stdin.removeListener("keypress", onKeypress);
        rl.close();
        resolve(selected);
      } else if (key.name === "c" && key.ctrl) {
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.exit(0);
      }
    };

    process.stdin.on("keypress", onKeypress);
  });
}

/**
 * Hàm hỏi xác nhận khi không tìm thấy schema
 */
function confirmGenerateModule(moduleName, availableSchemas) {
  return new Promise(function (resolve) {
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    var selected = false; // Default là No (an toàn hơn)
    var lineCount = 8;

    function render() {
      // Xóa màn hình và di chuyển con trỏ về vị trí ban đầu
      process.stdout.write("\x1B[G"); // Về đầu dòng
      process.stdout.write("\x1B[J"); // Xóa từ vị trí con trỏ đến hết
      process.stdout.write("\x1B[2J"); // Xóa toàn bộ màn hình
      process.stdout.write("\x1B[H"); // Về vị trí home

      // In nội dung
      console.log("\n".repeat(2));
      console.log("⚠️  Không tìm thấy schema '" + moduleName + "' trong API Document!");
      console.log("Các schema hiện có: " + availableSchemas.join(", "));
      console.log("\nBạn có chắc chắn muốn tiếp tục generate module này không?\n");
      console.log("  " + (selected ? "👉 [x]" : "   [ ]") + " Có (tiếp tục)");
      console.log("  " + (selected ? "   [ ]" : "👉 [x]") + " Không (hủy)");
      console.log("\n  ↑↓ để di chuyển, Enter để xác nhận");
    }

    render();

    var onKeypress = function (str, key) {
      // Ngăn không cho in ký tự điều khiển
      if (key.name === "up" || key.name === "down") {
        selected = !selected;
        render();
      } else if (key.name === "return" || key.name === "enter") {
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.stdin.removeListener("keypress", onKeypress);
        rl.close();
        resolve(selected);
      } else if (key.name === "c" && key.ctrl) {
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.exit(0);
      }
    };

    process.stdin.on("keypress", onKeypress);
  });
}

/**
 * Tự động thêm route mới vào config/routes.ts
 */
function updateRoutes(routesFilePath, moduleNameLower) {
  if (!fs.existsSync(routesFilePath)) return;

  var content = fs.readFileSync(routesFilePath, "utf8");
  var checkSingle = "path: '/" + moduleNameLower + "'";
  var checkDouble = 'path: "/' + moduleNameLower + '"';
  if (content.includes(checkSingle) || content.includes(checkDouble)) {
    console.log(
      "Route /" + moduleNameLower + " đã tồn tại trong routes.ts, bỏ qua."
    );
    return;
  }

  var newRoute = [
    "  {",
    "    path: '/" + moduleNameLower + "',",
    "    name: '" + moduleNameLower + "',",
    "    icon: 'table',",
    "    component: '@/pages/" + moduleNameLower + "',",
    "  },",
  ].join("\n");

  var rIdx = content.indexOf('path: "/"');
  if (rIdx === -1) rIdx = content.indexOf("path: '/'");
  if (rIdx !== -1) {
    var insertIdx = content.lastIndexOf("\n  {", rIdx);
    if (insertIdx === -1) insertIdx = content.lastIndexOf("{", rIdx);
    if (insertIdx !== -1) {
      var updated =
        content.slice(0, insertIdx) +
        "\n" +
        newRoute +
        content.slice(insertIdx);
      fs.writeFileSync(routesFilePath, updated, "utf8");
      console.log("Đã thêm route /" + moduleNameLower + " vào routes.ts");
    }
  }
}

// ======================================================
// MAIN
// ======================================================
async function main() {
  var args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("❌ Vui lòng cung cấp tên module!");
    console.log("Usage: npm run generate:module:api san-pham");
    process.exit(1);
  }

  var rawName = args[0];
  var moduleNameLower = rawName.toLowerCase().replace(/[^a-z0-9-]/g, "-");

  function toCamel(str) {
    return str.replace(/-([a-z])/g, function (_, c) {
      return c.toUpperCase();
    });
  }
  var moduleNameCamel =
    toCamel(rawName).charAt(0).toLowerCase() + toCamel(rawName).slice(1);
  var moduleNameUpper =
    toCamel(rawName).charAt(0).toUpperCase() + toCamel(rawName).slice(1);
  var entityName = moduleNameUpper + "Entity";

  console.log("🚀 Generating module: " + moduleNameUpper + " from API Schema");

  // 1. Fetch API Schema
  var apiUrl = getApiUrl();
  var apiData = await fetchApiSchema(apiUrl);

  if (!apiData || !apiData.components || !apiData.components.schemas) {
    console.error("❌ Không tìm thấy components.schemas trong API Document!");
    process.exit(1);
  }

  var schema = apiData.components.schemas[entityName];
  if (!schema) {
    // Hỏi người dùng có muốn tiếp tục không
    var shouldContinue = await confirmGenerateModule(
      entityName,
      Object.keys(apiData.components.schemas)
    );
    if (!shouldContinue) {
      console.log("\n❌ Đã hủy generate module.");
      process.exit(0);
    }

    // Nếu tiếp tục, tạo schema rỗng để generate từ tên module
    schema = {
      properties: {},
      required: [],
    };
  }

  // 2. Phân tích fields (loại trừ BaseEntity)
  var properties = schema.properties || {};
  var requiredList = schema.required || [];

  var availableFields = [];
  var enumFields = [];
  for (var key in properties) {
    if (baseEntityFields.indexOf(key) === -1) {
      var prop = properties[key];
      var isEnum = prop.enum && Array.isArray(prop.enum);
      availableFields.push({
        name: key,
        tsType: mapTypeToTs(prop, isEnum),
        required: requiredList.indexOf(key) !== -1,
        nullable: prop.nullable === true,
        isEnum: isEnum,
        enumValues: isEnum ? prop.enum : null,
      });
      if (isEnum) {
        enumFields.push({
          name: key,
          enumName: toPascalCase(key),
          enumValues: prop.enum,
        });
      }
    }
  }

  if (availableFields.length === 0) {
    console.warn(
      "⚠️ Schema " + entityName + " không có field nào ngoài BaseEntity!"
    );
  }

  // 3. CLI chọn fields
  var selectedFields = availableFields;
  if (availableFields.length > 0) {
    selectedFields = await selectFieldsUI(availableFields);
  }
  console.log("\n✅ Đã chọn " + selectedFields.length + " fields.");

  // 3b. Hỏi về việc tạo page và route
  var shouldGeneratePages = await askYesNo(
    "\n📄 Có cần tạo template page và component không?"
  );
  var shouldConfigureRoutes = false;
  if (shouldGeneratePages) {
    shouldConfigureRoutes = await askYesNo(
      "\n🔗 Có cần cấu hình sẵn trong routes không?"
    );
  }

  // 4. Chuẩn bị thư mục
  var root = process.cwd();
  var moduleDir = path.join(root, "src", "modules", moduleNameLower);
  var pagesDir = path.join(root, "src", "pages", moduleNameLower);
  var pagesComponentsDir = path.join(pagesDir, "components");

  var dirs = [
    moduleDir,
    path.join(moduleDir, "types"),
    path.join(moduleDir, "service"),
    path.join(moduleDir, "hooks"),
  ];
  if (enumFields.length > 0) {
    dirs.push(path.join(moduleDir, "common"));
  }
  if (shouldGeneratePages) {
    dirs.push(pagesDir, pagesComponentsDir);
  }
  dirs.forEach(function (dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // 5. Generate constants template (cho enum fields)
  var constantsTemplate = "";
  var enumImports = "";
  if (enumFields.length > 0) {
    var constantsLines = [];
    enumFields.forEach(function (enumField) {
      if (
        selectedFields.some(function (f) {
          return f.name === enumField.name;
        })
      ) {
        constantsLines.push("export enum " + enumField.enumName + " {");
        enumField.enumValues.forEach(function (val) {
          var key = toEnumKey(val);
          constantsLines.push("  " + key + ' = "' + val + '",');
        });
        constantsLines.push("}");
        constantsLines.push("");
      }
    });
    constantsTemplate = constantsLines.join("\n");

    // Tạo import string cho types file
    var enumNames = enumFields
      .filter(function (e) {
        return selectedFields.some(function (f) {
          return f.name === e.name;
        });
      })
      .map(function (e) {
        return e.enumName;
      })
      .join(", ");
    if (enumNames) {
      enumImports =
        "import { " + enumNames + ' } from "../common/constants";\n';
    }
  }

  // 5b. Generate types template
  var typesFieldsArr = [];
  selectedFields.forEach(function (f) {
    var isOptional = !f.required || f.nullable ? "?" : "";
    var fieldType = f.tsType;
    // Nếu là enum, đổi từ union type sang enum reference
    if (f.isEnum) {
      var enumName = toPascalCase(f.name);
      fieldType = enumName;
    }
    typesFieldsArr.push("  " + f.name + isOptional + ": " + fieldType + ";");
  });
  var typesFieldsStr = typesFieldsArr.join("\n");

  var typesTemplate = [
    'import { BaseEntity } from "@/config/types/base.types";',
    enumImports ? enumImports : "",
    "export interface " + moduleNameUpper + " extends BaseEntity {",
    typesFieldsStr,
    "}",
    "",
    "export interface Create" + moduleNameUpper + "Dto",
    "  extends Omit<" +
      moduleNameUpper +
      ', "id" | "createdAt" | "updatedAt" | "deletedAt" | "stt" | "ma"> {',
    "}",
    "",
    "export interface Update" + moduleNameUpper + "Dto",
    "  extends Partial<Create" + moduleNameUpper + "Dto> {",
    "}",
  ].join("\n");

  // 6. Generate service template
  var serviceTemplate = [
    'import { BaseService } from "@/config/service/base.service";',
    "import {",
    "  " + moduleNameUpper + ",",
    "  Create" + moduleNameUpper + "Dto,",
    "  Update" + moduleNameUpper + "Dto",
    '} from "../types/' + moduleNameLower + '.types";',
    "",
    "export class " + moduleNameUpper + "Service extends BaseService<",
    "  " + moduleNameUpper + ",",
    "  Create" + moduleNameUpper + "Dto,",
    "  Update" + moduleNameUpper + "Dto",
    "> {",
    '  protected resourcePath = "/' + moduleNameLower + '";',
    "}",
    "",
    "export const " +
      moduleNameCamel +
      "Service = new " +
      moduleNameUpper +
      "Service();",
  ].join("\n");

  // 7. Generate hooks template
  var hooksTemplate = [
    'import { useRequest } from "@umijs/max";',
    "import { " +
      moduleNameCamel +
      'Service } from "../service/' +
      moduleNameLower +
      '.service";',
    "import type {",
    "  " + moduleNameUpper + ",",
    "  Create" + moduleNameUpper + "Dto,",
    "  Update" + moduleNameUpper + "Dto,",
    '} from "../types/' + moduleNameLower + '.types";',
    "",
    "export const useGet" +
      moduleNameUpper +
      "Page = (options?: any, queryOptions?: any) => {",
    "  return useRequest(() => " +
      moduleNameCamel +
      "Service.getPage(options), { ...queryOptions });",
    "};",
    "",
    "export const useGet" +
      moduleNameUpper +
      "List = (options?: any, queryOptions?: any) => {",
    "  return useRequest(() => " +
      moduleNameCamel +
      "Service.getMany(options), { ...queryOptions });",
    "};",
    "",
    "export const useCount" +
      moduleNameUpper +
      " = (options?: any, queryOptions?: any) => {",
    "  return useRequest(() => " +
      moduleNameCamel +
      "Service.count(options), { ...queryOptions });",
    "};",
    "",
    "export const useGet" +
      moduleNameUpper +
      "One = (options?: any, queryOptions?: any) => {",
    "  return useRequest(() => " +
      moduleNameCamel +
      "Service.getOne(options), { ...queryOptions });",
    "};",
    "",
    "export const useExists" +
      moduleNameUpper +
      " = (options?: any, queryOptions?: any) => {",
    "  return useRequest(() => " +
      moduleNameCamel +
      "Service.exists(options), { ...queryOptions });",
    "};",
    "",
    "export const useGet" +
      moduleNameUpper +
      "ById = (id: number | undefined, queryOptions?: any) => {",
    "  return useRequest(() => " +
      moduleNameCamel +
      "Service.findById(id!), { ready: !!id, ...queryOptions });",
    "};",
    "",
    "export const useGet" +
      moduleNameUpper +
      "ByMa = (ma: string | undefined, queryOptions?: any) => {",
    "  return useRequest(() => " +
      moduleNameCamel +
      "Service.findByMa(ma!), { ready: !!ma, ...queryOptions });",
    "};",
    "",
    "export const useCreate" + moduleNameUpper + " = () => {",
    "  return useRequest((data: Create" +
      moduleNameUpper +
      "Dto) => " +
      moduleNameCamel +
      "Service.create(data), { manual: true });",
    "};",
    "",
    "export const useUpdate" + moduleNameUpper + " = () => {",
    "  return useRequest(({ id, data }: { id: number; data: Update" +
      moduleNameUpper +
      "Dto }) => " +
      moduleNameCamel +
      "Service.update(id, data), { manual: true });",
    "};",
    "",
    "export const useUpdateMany" + moduleNameUpper + " = () => {",
    "  return useRequest(({ filter, data }: { filter: Record<string, unknown>; data: Partial<" +
      moduleNameUpper +
      "> }) => " +
      moduleNameCamel +
      "Service.updateMany(filter, data), { manual: true });",
    "};",
    "",
    "export const useDelete" + moduleNameUpper + " = () => {",
    "  return useRequest((id: number) => " +
      moduleNameCamel +
      "Service.remove(id), { manual: true });",
    "};",
    "",
    "export const useDeleteMany" + moduleNameUpper + " = () => {",
    "  return useRequest((filter: Record<string, unknown>) => " +
      moduleNameCamel +
      "Service.deleteMany(filter), { manual: true });",
    "};",
    "",
    "export const useSoftDelete" + moduleNameUpper + " = () => {",
    "  return useRequest((filter: Record<string, unknown>) => " +
      moduleNameCamel +
      "Service.softDelete(filter), { manual: true });",
    "};",
    "",
    "export const useRestore" + moduleNameUpper + " = () => {",
    "  return useRequest((filter: Record<string, unknown>) => " +
      moduleNameCamel +
      "Service.restore(filter), { manual: true });",
    "};",
  ].join("\n");

  var indexTemplate = [
    'export * from "./types/' + moduleNameLower + '.types";',
    'export * from "./service/' + moduleNameLower + '.service";',
    'export * from "./hooks/' + moduleNameLower + '.hooks";',
  ].join("\n");

  // 8. Generate Table template - columns dựa trên selected fields, thay id bằng ma
  var columnsSnippet = [];
  // Thêm ma làm cột đầu tiên
  columnsSnippet.push(
    "    { title: 'Mã', dataIndex: 'ma', key: 'ma', width: 120, sorter: true },"
  );
  selectedFields.forEach(function (f) {
    var label = f.name.charAt(0).toUpperCase() + f.name.slice(1);
    columnsSnippet.push(
      "    { title: '" +
        label +
        "', dataIndex: '" +
        f.name +
        "', key: '" +
        f.name +
        "', sorter: true },"
    );
  });
  columnsSnippet.push(
    [
      "    {",
      "      title: 'Thao tác',",
      "      key: 'actions',",
      "      width: 150,",
      "      render: (_: any, record: " + moduleNameUpper + ") => (",
      "        <Space>",
      '          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>',
      '          <Button type="link" danger onClick={() => handleDelete(record)}>Xóa</Button>',
      "        </Space>",
      "      ),",
      "    }",
    ].join("\n")
  );

  var tableTemplate = [
    'import { useBoolean } from "ahooks";',
    'import { Button, Space, Spin } from "antd";',
    'import type { SorterResult } from "antd/es/table/interface";',
    'import type { FC } from "react";',
    'import React from "react";',
    "",
    'import BaseTable from "@/common/components/core/base-table";',
    'import BaseModal from "@/common/components/core/base-modal";',
    'import { qb } from "@/common/utils/query-builder";',
    "import {",
    "  useGet" + moduleNameUpper + "Page,",
    "  useDelete" + moduleNameUpper + ",",
    '} from "@/modules/' +
      moduleNameLower +
      "/hooks/" +
      moduleNameLower +
      '.hooks";',
    "import type { " +
      moduleNameUpper +
      ' } from "@/modules/' +
      moduleNameLower +
      "/types/" +
      moduleNameLower +
      '.types";',
    "",
    "import type { " +
      moduleNameUpper +
      'FormRef } from "./' +
      moduleNameUpper +
      'Form";',
    "import " + moduleNameUpper + 'Form from "./' + moduleNameUpper + 'Form";',
    "",
    "const " + moduleNameUpper + "Table: FC = () => {",
    "  const [queryParams, setQueryParams] = React.useState<Record<string, any>>({});",
    "  const [refreshKey, setRefreshKey] = React.useState(0);",
    "",
    "  const { data, loading, refresh } = useGet" + moduleNameUpper + "Page(",
    "    { ...queryParams, _t: refreshKey },",
    "    { refreshDeps: [refreshKey] }",
    "  );",
    "  const { run: deleteRecord, loading: deleting } = useDelete" +
      moduleNameUpper +
      "();",
    "",
    "  const [deleteModalOpen, { setTrue: openDeleteModal, setFalse: closeDeleteModal }] = useBoolean(false);",
    "  const [selectedRecord, setSelectedRecord] = React.useState<" +
      moduleNameUpper +
      " | null>(null);",
    "",
    "  const [formOpen, { setTrue: openForm, setFalse: closeForm }] = useBoolean(false);",
    "  const [isEdit, setIsEdit] = React.useState(false);",
    "  const formRef = React.useRef<" + moduleNameUpper + "FormRef>(null);",
    "",
    "  const handleSearch = (values: Record<string, any>) => {",
    "    const query = qb<" + moduleNameUpper + ">().page(1).size(10);",
    "    Object.entries(values).forEach(([key, value]) => {",
    "      if (value) {",
    "        query.like(key as keyof " +
      moduleNameUpper +
      ", value as string);",
    "      }",
    "    });",
    "    setQueryParams(query.buildQueryParams());",
    "    setRefreshKey((k) => k + 1);",
    "  };",
    "",
    "  const handleTableChange = (",
    "    pagination: any,",
    "    filters: any,",
    "    sorter: SorterResult<" +
      moduleNameUpper +
      "> | SorterResult<" +
      moduleNameUpper +
      ">[]",
    "  ) => {",
    "    const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;",
    "",
    "    const query = qb<" + moduleNameUpper + ">().page(1).size(10);",
    "    Object.entries(queryParams.filter || {}).forEach(([key, value]) => {",
    "      if (value) {",
    "        query.like(key as keyof " +
      moduleNameUpper +
      ", value as string);",
    "      }",
    "    });",
    "    if (singleSorter?.field) {",
    "      const field = singleSorter.field as keyof " + moduleNameUpper + ";",
    '      const order = singleSorter.order === "ascend" ? "ASC" : "DESC";',
    "      query.orderBy(field, order);",
    "    }",
    "",
    "    setQueryParams(query.buildQueryParams());",
    "    setRefreshKey((k) => k + 1);",
    "  };",
    "",
    "  const handleDelete = (record: " + moduleNameUpper + ") => {",
    "    setSelectedRecord(record);",
    "    openDeleteModal();",
    "  };",
    "",
    "  const confirmDelete = async () => {",
    "    if (selectedRecord?.id) {",
    "      await deleteRecord(selectedRecord.id);",
    "      closeDeleteModal();",
    "      refresh();",
    "    }",
    "  };",
    "",
    "  const handleEdit = (record: " + moduleNameUpper + ") => {",
    "    setSelectedRecord(record);",
    "    setIsEdit(true);",
    "    formRef.current?.setData(record);",
    "    openForm();",
    "  };",
    "",
    "  const handleCreate = () => {",
    "    setSelectedRecord(null);",
    "    setIsEdit(false);",
    "    formRef.current?.reset();",
    "    openForm();",
    "  };",
    "",
    "  const handleFormSuccess = () => {",
    "    closeForm();",
    "    setIsEdit(false);",
    "    refresh();",
    "  };",
    "",
    "  const columns = [",
    columnsSnippet.join("\n"),
    "  ];",
    "",
    '  const deleteContent = selectedRecord?.id ? "Bạn có chắc chắn muốn xóa?" : "Xác nhận xóa?";',
    "",
    "  return (",
    "    <>",
    "      <BaseTable<" + moduleNameUpper + ">",
    "        headerTitle={",
    "          <Space>",
    '            {loading && <Spin size="small" />}',
    '            <Button type="primary" onClick={handleCreate}>Thêm mới</Button>',
    "          </Space>",
    "        }",
    "        loading={loading}",
    "        dataSource={data?.items}",
    "        columns={columns}",
    '        rowKey="id"',
    "        pagination={data?.pagination}",
    "        onChange={handleTableChange}",
    "        onSubmit={handleSearch}",
    "        search={{ labelWidth: 120 }}",
    "      />",
    "",
    "      <BaseModal.Form",
    "        open={formOpen}",
    '        title={isEdit ? "Sửa ' +
      moduleNameUpper +
      '" : "Thêm mới ' +
      moduleNameUpper +
      '"}',
    "        onCancel={closeForm}",
    "        onSubmit={() => formRef.current?.submit()}",
    "        loading={false}",
    '        submitText={isEdit ? "Cập nhật" : "Thêm mới"}',
    "      >",
    "        <" +
      moduleNameUpper +
      "Form ref={formRef} onSuccess={handleFormSuccess} />",
    "      </BaseModal.Form>",
    "",
    "      <BaseModal.Confirm",
    "        open={deleteModalOpen}",
    '        title="Xác nhận xóa"',
    "        content={deleteContent}",
    "        onConfirm={confirmDelete}",
    "        onCancel={closeDeleteModal}",
    "        isConfirming={deleting}",
    '        icon="danger"',
    "      />",
    "    </>",
    "  );",
    "};",
    "",
    "export default " + moduleNameUpper + "Table;",
  ].join("\n");

  // 9. Generate Form template - fields dựa trên selected fields
  var formFieldsSnippet = [];
  var formImports = 'import { Form, Input } from "antd";';
  selectedFields.forEach(function (f) {
    var label = f.name.charAt(0).toUpperCase() + f.name.slice(1);
    var isRequired = f.required
      ? "rules={[{ required: true, message: 'Vui lòng nhập " + label + "' }]}"
      : "";

    if (f.isEnum) {
      // Trường enum: dùng Select
      var enumName = toPascalCase(f.name);
      var enumOptions = f.enumValues
        .map(function (val) {
          var key = toEnumKey(val);
          return (
            '        <Select.Option value="' +
            val +
            '" key="' +
            val +
            '">' +
            val +
            "</Select.Option>"
          );
        })
        .join("\n");
      formFieldsSnippet.push(
        [
          "        <Form.Item",
          '          label="' + label + '"',
          '          name="' + f.name + '"',
          isRequired,
          "        >",
          '          <Select placeholder="Chọn ' + label + '">',
          enumOptions,
          "          </Select>",
          "        </Form.Item>",
        ].join("\n")
      );
    } else {
      // Trường thường: dùng Input
      formFieldsSnippet.push(
        [
          "        <Form.Item",
          '          label="' + label + '"',
          '          name="' + f.name + '"',
          isRequired,
          "        >",
          '          <Input placeholder="Nhập ' + label + '" />',
          "        </Form.Item>",
        ].join("\n")
      );
    }
  });

  // Update imports nếu có enum fields
  var hasEnumFields = selectedFields.some(function (f) {
    return f.isEnum;
  });
  if (hasEnumFields) {
    formImports = 'import { Form, Input, Select } from "antd";';
  }

  var formTemplate = [
    formImports,
    'import React, { useImperativeHandle, forwardRef, useCallback, useState } from "react";',
    "",
    'import BaseForm from "@/common/components/core/base-form";',
    "import {",
    "  useCreate" + moduleNameUpper + ",",
    "  useUpdate" + moduleNameUpper + ",",
    '} from "@/modules/' +
      moduleNameLower +
      "/hooks/" +
      moduleNameLower +
      '.hooks";',
    "import type {",
    "  " + moduleNameUpper + ",",
    "  Create" + moduleNameUpper + "Dto,",
    "  Update" + moduleNameUpper + "Dto,",
    '} from "@/modules/' +
      moduleNameLower +
      "/types/" +
      moduleNameLower +
      '.types";',
    "",
    "export interface " + moduleNameUpper + "FormRef {",
    "  setData: (data: " + moduleNameUpper + ") => void;",
    "  reset: () => void;",
    "  submit: () => void;",
    "}",
    "",
    "const " +
      moduleNameUpper +
      "Form = forwardRef<" +
      moduleNameUpper +
      "FormRef, { onSuccess?: () => void }>(",
    "  ({ onSuccess }, ref) => {",
    "    const [form] = Form.useForm();",
    "    const [editingId, setEditingId] = useState<number | null>(null);",
    "",
    "    const { run: create, loading: creating } = useCreate" +
      moduleNameUpper +
      "();",
    "    const { run: update, loading: updating } = useUpdate" +
      moduleNameUpper +
      "();",
    "",
    "    useImperativeHandle(ref, () => ({",
    "      setData: (data: " + moduleNameUpper + ") => {",
    "        form.resetFields();",
    "        setEditingId(data.id);",
    "        setTimeout(() => {",
    "          form.setFieldsValue(data);",
    "        }, 0);",
    "      },",
    "      reset: () => {",
    "        setEditingId(null);",
    "        form.resetFields();",
    "      },",
    "      submit: () => form.submit(),",
    "    }));",
    "",
    "    const handleSubmit = useCallback(",
    "      async (values: Create" +
      moduleNameUpper +
      "Dto | Update" +
      moduleNameUpper +
      "Dto) => {",
    "        if (editingId) {",
    "          await update({ id: editingId, data: values as Update" +
      moduleNameUpper +
      "Dto });",
    "        } else {",
    "          await create(values as Create" + moduleNameUpper + "Dto);",
    "        }",
    "        onSuccess?.();",
    "      },",
    "      [editingId, create, update, onSuccess]",
    "    );",
    "",
    "    return (",
    "      <BaseForm",
    "        form={form}",
    "        onFinish={handleSubmit}",
    "        isSubmitting={creating || updating}",
    '        submitText={editingId ? "Cập nhật" : "Thêm mới"}',
    '        layout="vertical"',
    "      >",
    formFieldsSnippet.join("\n"),
    "      </BaseForm>",
    "    );",
    "  }",
    ");",
    "",
    moduleNameUpper + 'Form.displayName = "' + moduleNameUpper + 'Form";',
    "",
    "export default " + moduleNameUpper + "Form;",
  ].join("\n");

  // 10. Generate Page template
  var pageTemplate = [
    'import { PageContainer } from "@ant-design/pro-components";',
    "import type { FC } from 'react';",
    "import React from 'react';",
    "",
    "import " +
      moduleNameUpper +
      "Table from './components/" +
      moduleNameUpper +
      "Table';",
    "",
    "const " + moduleNameUpper + "Page: FC = () => {",
    "  return (",
    "    <PageContainer",
    '      title="Quản lý ' + moduleNameUpper + '"',
    "    >",
    "      <div style={{ padding: 24 }}>",
    "        <" + moduleNameUpper + "Table />",
    "      </div>",
    "    </PageContainer>",
    "  );",
    "};",
    "",
    "export default " + moduleNameUpper + "Page;",
  ].join("\n");

  // 11. Write files
  var files = [
    { p: "types/" + moduleNameLower + ".types.ts", c: typesTemplate },
    { p: "service/" + moduleNameLower + ".service.ts", c: serviceTemplate },
    { p: "hooks/" + moduleNameLower + ".hooks.ts", c: hooksTemplate },
    { p: "index.ts", c: indexTemplate },
  ];

  // Thêm constants file nếu có enum fields
  if (constantsTemplate) {
    files.push({ p: "common/constants.ts", c: constantsTemplate });
  }

  files.forEach(function (file) {
    var full = path.join(moduleDir, file.p);
    fs.writeFileSync(full, file.c, "utf8");
    console.log("✅ Created:", full);
  });

  // Generate pages files nếu được chọn
  if (shouldGeneratePages) {
    var tablePath = path.join(
      pagesComponentsDir,
      moduleNameUpper + "Table.tsx"
    );
    fs.writeFileSync(tablePath, tableTemplate, "utf8");
    console.log("✅ Created:", tablePath);

    var formPath = path.join(pagesComponentsDir, moduleNameUpper + "Form.tsx");
    fs.writeFileSync(formPath, formTemplate, "utf8");
    console.log("✅ Created:", formPath);

    var pagePath = path.join(pagesDir, "index.tsx");
    fs.writeFileSync(pagePath, pageTemplate, "utf8");
    console.log("✅ Created:", pagePath);

    // Update routes nếu được chọn
    if (shouldConfigureRoutes) {
      var routesFilePath = path.join(root, "config", "routes.ts");
      updateRoutes(routesFilePath, moduleNameLower);
    }
  }

  console.log("\n✨ Module " + moduleNameUpper + " generated successfully!");
  console.log("\n📁 Cấu trúc:");
  console.log("   src/modules/" + moduleNameLower + "/");
  if (shouldGeneratePages) {
    console.log("   src/pages/" + moduleNameLower + "/components/");
  }
  if (constantsTemplate) {
    console.log("   ✅ Có file constants.ts với enum definitions");
  }
  console.log("\n📋 Fields đã chọn:");
  selectedFields.forEach(function (f) {
    console.log(
      "   - " + f.name + ": " + (f.isEnum ? toPascalCase(f.name) : f.tsType)
    );
  });
}

main().catch(function (err) {
  console.error("❌ Lỗi:", err);
  process.exit(1);
});
