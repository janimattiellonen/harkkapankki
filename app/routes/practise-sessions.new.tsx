import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import PractiseSessionForm from "~/pages/PractiseSessionForm";
import { fetchSectionsForPractiseSession } from "~/services/sections.server";

export const meta: MetaFunction = () => {
  return [{ title: "Design Practice Session - Harkkapankki" }];
};

export async function loader() {
  const sections = await fetchSectionsForPractiseSession('en');
  return json({ sections });
}

export default function NewPractiseSession() {
  const { sections } = useLoaderData<typeof loader>();
  return <PractiseSessionForm sections={sections} />;
}
