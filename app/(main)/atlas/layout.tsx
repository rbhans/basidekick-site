import { ReactNode } from "react";

interface AtlasLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function AtlasLayout({ children, modal }: AtlasLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
