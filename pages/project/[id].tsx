import { GetServerSideProps, NextPage } from "next";
import React, { createContext, useEffect, useState } from "react";
import { getUserFromSession } from "../../back/auth";
import { firebaseAdmin } from "../../back/firebaseAdmin";
import { dynamicConverter, ProjectEntity as projectEntity, ProjectConverter, TrackEntity } from "../../firebase/firestore";
import { toObject } from "../../utils";
import dynamic from "next/dynamic";
const Daw = dynamic(() => import("../../component/daw"), {
  ssr: false,
});

const keyPair: any = {};

const Project: NextPage<ProjectProp> = ({ user, project }) => {
  return (
    <main id="daw" onContextMenu={(e) => e.preventDefault()}>
      <Daw project={project} user={user} />
    </main>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<ProjectProp> = async (ctx) => {
  const { id } = ctx.query;
  const project = await firebaseAdmin
    .firestore()
    .collection("project")
    .withConverter(ProjectConverter as any)
    .doc(id as string)
    .get()
    .then(async (data) => {
      const doc = data.data() as projectEntity;
      const tracksRef = data.ref.collection("tracks").withConverter(dynamicConverter(TrackEntity) as any);
      doc.trackList = (await tracksRef.get().then((res) =>
        res.docs.map(async (x) => {
          const ref = x.ref;
          const data = x.data();
          const colRef = ref.collection("regions");
          const docs = await colRef.get();
          console.log(docs);
          return data;
        })
      )) as any;
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
