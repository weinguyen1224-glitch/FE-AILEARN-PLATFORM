import { PageContainer } from "@ant-design/pro-components";
import type { FC } from 'react';
import React from 'react';

import UserTable from '@/modules/user/components/UserTable';

const UserPage: FC = () => {
  return (
    <PageContainer
      title="Quản lý User"
      subTitle="Danh sách và thao tác với user"
    >
      <div style={{ padding: 24 }}>
        <UserTable />
      </div>
    </PageContainer>
  );
};

export default UserPage;
