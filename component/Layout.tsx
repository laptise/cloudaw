import { useRouter } from "next/dist/client/router";
import React, { ReactElement } from "react";
import Link from "next/link";
import nookies from "nookies";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { GetServerSideProps } from "next";
import { getUserFromSession } from "../back/auth";
export interface CommonProps {
  user: UserRecord;
}
interface LayoutProps extends CommonProps, React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  children?: ReactElement;
}

export default function Layout(props: LayoutProps) {
  const attr = { ...props, ...{ user: undefined, children: undefined } };
  const { children, user } = props;
  return (
    <main {...attr}>
      {user && (
        <header>
          <Link href="/" passHref>
            <button>Dashboard</button>
          </Link>
          <Link href="/profile" passHref>
            {user.displayName || user.email}
          </Link>
        </header>
      )}
      {children}
    </main>
  );
}
