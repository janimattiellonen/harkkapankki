import { Link } from '@remix-run/react';

type FeatureBoxProps = {
  imagePath: string;
  title: string;
  href: string;
};

function FeatureBox({ imagePath, title, href }: FeatureBoxProps) {
  return (
    <Link
      to={href}
      className="relative block overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105"
      style={{ minHeight: '300px' }}
    >
      <img src={imagePath} alt={title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-md bg-gray-800/60 px-6 py-3 backdrop-blur-sm">
          <h2 className="text-center text-2xl font-bold text-white">{title}</h2>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FeatureBox
          imagePath="/app/asssets/images/exercise-plan.png"
          title="Design a practise session"
          href="/practise-sessions/new"
        />
        <FeatureBox
          imagePath="/app/asssets/images/piggybank.png"
          title="Exercise bank"
          href="/exercises"
        />

        <FeatureBox
          imagePath={'/app/asssets/images/exercise.png'}
          title={'Create a new exercise'}
          href={'/exercises/new'}
        />
      </div>
    </div>
  );
}
