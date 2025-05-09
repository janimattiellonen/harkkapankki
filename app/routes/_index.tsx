// app/routes/_index.tsx
import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Harkkapankki - Disc Golf Training Program" }];
};

export default function Index() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Welcome to Harkkapankki</h1>
      <p className="mt-4">Create your 90-minute disc golf training program.</p>
    </div>
  );
}