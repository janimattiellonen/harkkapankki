import { Link } from '@remix-run/react';

type SectionItem = {
  id: string;
  order: number;
  section: {
    id: string;
    slug: string;
    translations: Array<{
      name: string;
    }>;
  };
  exerciseType: {
    id: string;
    translations: Array<{
      name: string;
    }>;
  };
};

type PracticeSessionData = {
  id: string;
  name: string | null;
  description: string | null;
  sessionLength: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  sectionItems: SectionItem[];
};

type PractiseSessionDetailProps = {
  session: PracticeSessionData;
};

export default function PractiseSessionDetail({ session }: PractiseSessionDetailProps) {
  const formatDate = (dateString: Date | string, locale: string = 'fi-FI') => {
    return new Date(dateString).toLocaleDateString(locale);
  };

  // Group items by section
  const itemsBySection = session.sectionItems.reduce(
    (acc, item) => {
      const sectionId = item.section.id;
      if (!acc[sectionId]) {
        acc[sectionId] = {
          section: item.section,
          items: [],
        };
      }
      acc[sectionId].items.push(item);
      return acc;
    },
    {} as Record<string, { section: SectionItem['section']; items: SectionItem[] }>
  );

  const sections = Object.values(itemsBySection);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/practise-sessions"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Practice Sessions
        </Link>
        <h1 className="text-3xl font-bold mt-2">{session.name || 'Untitled Session'}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Created: {formatDate(session.createdAt)}
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {session.sessionLength} minutes
          </div>
        </div>
      </div>

      {/* Description */}
      {session.description && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{session.description}</p>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Session Plan</h2>
        {sections.length === 0 ? (
          <p className="text-gray-500">No exercises added to this session.</p>
        ) : (
          sections.map(({ section, items }) => (
            <div key={section.id} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">
                {section.translations[0]?.name || section.slug}
              </h3>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item.id} className="flex items-start p-3 bg-gray-50 rounded-md">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {item.order}
                    </span>
                    <span className="text-gray-700">
                      {item.exerciseType.translations[0]?.name || item.exerciseType.id}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
