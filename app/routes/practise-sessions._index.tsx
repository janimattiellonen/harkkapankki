import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import PractiseSessionsList from "~/pages/PractiseSessionsList";
import { fetchPracticeSessions } from "~/services/practiceSessions.server";

export const meta: MetaFunction = () => {
  return [{ title: "Practice Sessions - Harkkapankki" }];
};

export async function loader() {
  const sessions = await fetchPracticeSessions();
  return json({ sessions });
}

export default function PracticeSessionsIndex() {
  const { sessions } = useLoaderData<typeof loader>();
  return <PractiseSessionsList sessions={sessions} />;
}
