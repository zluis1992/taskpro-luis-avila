'use client';

import Form from 'devextreme-react/form';

export function DxFormInner({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) {
  return <Form {...props}>{children}</Form>;
}
