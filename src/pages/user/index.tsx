import { PageContainer } from "@ant-design/pro-components";
import type { FC } from "react";

import UserTable from "./components/UserTable";

const UserPage: FC = () => {
  return (
    <PageContainer title="Quản lý User">
      <div style={{ padding: 24 }}>
        <UserTable />
      </div>
    </PageContainer>
  );
};

export default UserPage;
