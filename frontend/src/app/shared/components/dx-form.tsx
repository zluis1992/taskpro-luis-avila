'use client';

import dynamic from 'next/dynamic';

const DxFormInner = dynamic(
  () => import('./dx-form-inner').then((m) => ({ default: m.DxFormInner })),
  { ssr: false, loading: () => null },
);

export function DxForm({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) {
  return <DxFormInner {...props}>{children}</DxFormInner>;
}

export { SimpleItem, GroupItem, ButtonItem } from 'devextreme-react/form';
