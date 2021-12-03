import React, { ReactElement } from "react";

export interface CommonProps {
  userName: string;
}
interface LayoutProps extends CommonProps {
  children?: ReactElement;
}

export default function Layout({ children, userName }: LayoutProps) {
  return (
    <main>
      <header>{userName}</header>
      {children}
    </main>
  );
}
