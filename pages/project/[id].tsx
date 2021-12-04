import { getDocs } from "@firebase/firestore";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import { getUserFromSession } from "../../back/auth";
import { firebaseAdmin } from "../../back/firebaseAdmin";
import Daw, { ProjectProp } from "../../component/daw";
import Layout, { UserProps } from "../../component/Layout";
import { dynamicConverter, Project as projectEntity, ProjectConverter, Track } from "../../firebase/model";
import { toObject } from "../../utils";

interface Props extends UserProps, ProjectProp {}
const Project: NextPage<Props> = ({ user, project }) => {
  return (
    <Layout user={user}>
      <Daw project={project} user={user} />
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
    .then(async (data) => {
      const doc = data.data() as projectEntity;
      const tracksRef = data.ref.collection("tracks").withConverter(dynamicConverter(Track) as any);
      doc.trackList = (await tracksRef.get().then((res) => res.docs.map((x) => x.data()))) as any;
      console.log(doc.trackList);
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
