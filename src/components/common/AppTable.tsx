import { DataTable } from 'primereact/datatable';
import type { ReactNode } from 'react';

export interface AppTableProps {
  value: unknown[];
  children?: ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}

const AppTable = ({ value, children, loading = false, emptyMessage = 'Không có dữ liệu' }: Readonly<AppTableProps>) => (
  <DataTable value={value} loading={loading} emptyMessage={emptyMessage} responsiveLayout="scroll" paginator rows={10}>
    {children}
  </DataTable>
);

export default AppTable;
