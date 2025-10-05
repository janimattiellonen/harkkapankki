import type { MetaFunction } from "@remix-run/node";
import PractiseSessionForm from "~/pages/PractiseSessionForm";

export const meta: MetaFunction = () => {
  return [{ title: "Design Practice Session - Harkkapankki" }];
};

export default function NewPractiseSession() {
  return <PractiseSessionForm />;
}
