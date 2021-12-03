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
interface LayoutProps extends CommonProps {
  children?: ReactElement;
}

export default function Layout({ children, user }: LayoutProps) {
  const router = useRouter();
  return (
    <main>
      <Link href="/profile" passHref>
        <header>{user.displayName || user.email}</header>
      </Link>
      {children}
    </main>
  );
}
