import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import { getUserFromSession } from "../../back/auth";
import { firebaseAdmin } from "../../back/firebaseAdmin";
import Daw, { ProjectProp } from "../../component/daw";
import Layout, { CommonProps } from "../../component/Layout";
import { Project as projectEntity, ProjectConverter } from "../../firebase/model";
import { toObject } from "../../utils";

interface Props extends CommonProps, ProjectProp {}
const Project: NextPage<Props> = ({ user, project }) => {
  return (
    <Layout user={user}>
      <Daw project={project} />
    </Layout>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const { id } = ctx.query;
  const project = await firebaseAdmin
    .firestore()
    .collection("project")
    .withConverter(ProjectConverter as any)
    .doc(id as string)
    .get()
    .then((data) => {
      const doc = data.data() as projectEntity;
      doc.id = data.id;
      return doc;
    });
  const user = await getUserFromSession(ctx);
  if (user && project) return { props: { user: toObject(user), project: toObject(project) } };
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
