import Head from "next/head";
import Chat from "../components/Chat.jsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>材料与化工智能助理</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="app-shell">
        <Chat />
      </div>
    </>
  );
}
