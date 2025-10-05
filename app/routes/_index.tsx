// app/routes/_index.tsx
import type { V2_MetaFunction } from "@remix-run/node";
import HomePage from "~/pages/HomePage";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Harkkapankki - Disc Golf Training Program" }];
};

export default function Index() {
  return <HomePage />;
}