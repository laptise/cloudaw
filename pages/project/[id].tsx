import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import { getUserFromSession } from "../../back/auth";
import { firebaseAdmin } from "../../back/firebaseAdmin";
import Daw from "../../component/daw";
import Layout, { CommonProps } from "../../component/Layout";
import { toObject } from "../../utils";

interface Props extends CommonProps {
  name: string;
}
const Project: NextPage<Props> = ({ user, name }) => {
  return (
    <Layout user={user}>
      <Daw name={name} />
    </Layout>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<CommonProps> = async (ctx) => {
  const { id } = ctx.query;
  const data = await firebaseAdmin
    .firestore()
    .collection("project")
    .doc(id as string)
    .get()
    .then((data) => data.data());
  const user = await getUserFromSession(ctx);
  if (user && data) return { props: { user: toObject(user), name: data.name } };
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
