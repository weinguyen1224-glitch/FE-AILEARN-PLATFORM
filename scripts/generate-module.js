#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script generate module for ant-design-pro
 * Usage: npm run generate:module module-name
 */

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Vui lòng cung cấp tên module!');
  console.log('Usage: npm run generate:module san-pham');
  process.exit(1);
}

const rawName = args[0];
const moduleNameLower = rawName.toLowerCase();

const toCamel = (str) => str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const moduleNameCamel =
  toCamel(rawName).charAt(0).toLowerCase() + toCamel(rawName).slice(1);

const moduleNameUpper =
  toCamel(rawName).charAt(0).toUpperCase() + toCamel(rawName).slice(1);

console.log(`🚀 Generating module: ${moduleNameUpper}`);

const root = process.cwd();
const modulesDir = path.join(root, 'src', 'modules');
const moduleDir = path.join(modulesDir, moduleNameLower);

const layers = ['types', 'service', 'hooks', 'components'];
const dirs = [
  moduleDir,
  ...layers.map((l) => path.join(moduleDir, l)),
  path.join(moduleDir, 'pages'),
];

dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const typesTemplate = `import { BaseEntity } from "@/core/types/base.types";

export interface ${moduleNameUpper} extends BaseEntity {
}

export interface Create${moduleNameUpper}Dto
  extends Omit<${moduleNameUpper}, "id" | "createdAt" | "updatedAt" | "deletedAt"> {
}

export interface Update${moduleNameUpper}Dto
  extends Partial<Create${moduleNameUpper}Dto> {
}
`;

const serviceTemplate = `import { BaseService } from "@/core/service/base.service";
import {
  ${moduleNameUpper},
  Create${moduleNameUpper}Dto,
  Update${moduleNameUpper}Dto
} from "../types/${moduleNameLower}.types";

export class ${moduleNameUpper}Service extends BaseService<
  ${moduleNameUpper},
  Create${moduleNameUpper}Dto,
  Update${moduleNameUpper}Dto
> {
  protected resourcePath = "/${moduleNameLower}";
}

export const ${moduleNameCamel}Service = new ${moduleNameUpper}Service();
`;

const hooksTemplate = `import { useRequest } from "@umijs/max";
import { ${moduleNameCamel}Service } from "../service/${moduleNameLower}.service";
import {
  ${moduleNameUpper},
  Create${moduleNameUpper}Dto,
  Update${moduleNameUpper}Dto
} from "../types/${moduleNameLower}.types";

export const useGet${moduleNameUpper} = (options?: any) => {
  return useRequest(() => ${moduleNameCamel}Service.getMany(options));
};

export const useGetOne${moduleNameUpper} = (options?: any) => {
  return useRequest(() => ${moduleNameCamel}Service.getOne(options));
};

export const useCreate${moduleNameUpper} = () => {
  return useRequest(
    (data: Create${moduleNameUpper}Dto) => ${moduleNameCamel}Service.create(data),
    { manual: true }
  );
};

export const useUpdate${moduleNameUpper} = () => {
  return useRequest(
    ({ id, data }: { id: number; data: Update${moduleNameUpper}Dto }) =>
      ${moduleNameCamel}Service.update(id, data),
    { manual: true }
  );
};

export const useRemove${moduleNameUpper} = () => {
  return useRequest(
    (id: number) => ${moduleNameCamel}Service.remove(id),
    { manual: true }
  );
};
`;

const pageTemplate = `import type { FC } from 'react';
import React from 'react';

const ${moduleNameUpper}Page: FC = () => {
  return (
    <div>
      <h1>${moduleNameUpper} Page</h1>
    </div>
  );
};

export default ${moduleNameUpper}Page;
`;

const indexTemplate = `export * from "./types/${moduleNameLower}.types";
export * from "./service/${moduleNameLower}.service";
export * from "./hooks/${moduleNameLower}.hooks";
`;

const files = [
  { p: `types/${moduleNameLower}.types.ts`, c: typesTemplate },
  { p: `service/${moduleNameLower}.service.ts`, c: serviceTemplate },
  { p: `hooks/${moduleNameLower}.hooks.ts`, c: hooksTemplate },
  { p: `index.ts`, c: indexTemplate },
];

files.forEach(({ p, c }) => {
  const full = path.join(moduleDir, p);
  fs.writeFileSync(full, c, 'utf8');
  console.log('✅ Created:', full);
});

const pagePath = path.join(moduleDir, 'pages', 'index.tsx');
fs.writeFileSync(pagePath, pageTemplate, 'utf8');
console.log('✅ Created:', pagePath);

console.log(`\n✨ Module ${moduleNameUpper} generated successfully!`);
console.log(`\n📁 Structure:`);
console.log(`   src/modules/${moduleNameLower}/`);
console.log(`   ├── types/`);
console.log(`   ├── service/`);
console.log(`   ├── hooks/`);
console.log(`   ├── components/`);
console.log(`   └── pages/`);
console.log(`\n⚠️  Remember to add route in config/routes.ts:`);
console.log(`   component: '@/modules/${moduleNameLower}/pages'`);
