import { PageContainer } from "@ant-design/pro-components";
import type { FC } from 'react';
import React from 'react';

import TestTable from '@/modules/test/components/TestTable';

const TestPage: FC = () => {
  return (
    <PageContainer
      title="Quản lý Test"
      subTitle="Danh sách và thao tác với test"
    >
      <div style={{ padding: 24 }}>
        <TestTable />
      </div>
    </PageContainer>
  );
};

export default TestPage;
