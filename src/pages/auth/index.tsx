import { PageContainer } from "@ant-design/pro-components";
import type { FC } from 'react';
import React from 'react';

import AuthTable from './components/AuthTable';

const AuthPage: FC = () => {
  return (
    <PageContainer
      title="Quản lý Auth"
    >
      <div style={{ padding: 24 }}>
        <AuthTable />
      </div>
    </PageContainer>
  );
};

export default AuthPage;
