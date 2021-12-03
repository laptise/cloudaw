import { GetServerSideProps, NextPage } from "next";
import Layout, { CommonProps } from "../component/Layout";
import nookies from "nookies";
import { firebaseAdmin } from "../back/firebaseAdmin";

const Profile: NextPage<CommonProps> = ({ userName }) => {
  return (
    <Layout userName={userName}>
      <div></div>
    </Layout>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<CommonProps> = async (ctx) => {
  const cookies = nookies.get(ctx);
  const session = cookies.session || "";
  // セッションIDを検証して、認証情報を取得する
  const user = await firebaseAdmin
    .auth()
    .verifySessionCookie(session, true)
    .catch(() => null);
  // Pass data to the page via props

  if (user?.email) return { props: { userName: user.email } };
  else {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};

export default Profile;
