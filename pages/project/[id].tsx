import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import { getUserFromSession } from "../../back/auth";
import Daw from "../../component/daw";
import Layout, { CommonProps } from "../../component/Layout";
import { toObject } from "../../utils";

const Project: NextPage<CommonProps> = ({ user }) => {
  return (
    <Layout user={user}>
      <Daw />
    </Layout>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<CommonProps> = async (ctx) => {
  const { id } = ctx.query;
  console.log(ctx.query);
  const user = await getUserFromSession(ctx);
  if (user) return { props: { user: toObject(user) } };
  else {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};

export default Project;
