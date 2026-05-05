import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { SeasonCoverage } from '~/services/seasons.server';

type SeasonCoveragePageProps = {
  coverage: SeasonCoverage;
};

function formatDate(value: Date | string | null): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleDateString('fi-FI');
}

export default function SeasonCoveragePage({ coverage }: SeasonCoveragePageProps) {
  const { t } = useTranslation();
  const { season, totalSessions, perType, perSection } = coverage;

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to={`/seasons/${season.slug}`}
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          {t('seasons.backToSeasons')}
        </Link>
        <h1 className="mt-2 text-3xl font-bold">{t('coverage.title', { season: season.name })}</h1>
        <p className="mt-1 text-gray-600">{t('coverage.subtitle', { count: totalSessions })}</p>
      </div>

      {totalSessions === 0 ? (
        <div className="rounded border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-700">{t('coverage.emptyState')}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {(coverage.hints.staleTypes.length > 0 ||
            coverage.hints.recentRepeats.length > 0 ||
            coverage.hints.lowDiversitySections.length > 0) && (
            <section className="rounded border border-amber-300 bg-amber-50 p-4">
              <h2 className="mb-3 text-xl font-semibold text-amber-900">{t('hints.heading')}</h2>
              <div className="space-y-4 text-sm text-amber-900">
                {coverage.hints.staleTypes.length > 0 && (
                  <div>
                    <h3 className="font-semibold">{t('hints.staleHeading')}</h3>
                    <ul className="mt-1 list-disc list-inside">
                      {coverage.hints.staleTypes.map(hint => (
                        <li key={hint.typeId}>
                          {t('hints.staleItem', {
                            name: hint.typeName,
                            count: hint.sessionsSinceLastUse,
                          })}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {coverage.hints.recentRepeats.length > 0 && (
                  <div>
                    <h3 className="font-semibold">{t('hints.repeatHeading')}</h3>
                    <ul className="mt-1 list-disc list-inside">
                      {coverage.hints.recentRepeats.map((hint, idx) => (
                        <li key={`${hint.exerciseId}-${idx}`}>
                          {t('hints.repeatItem', {
                            name: hint.exerciseName,
                            gap: hint.gap,
                          })}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {coverage.hints.lowDiversitySections.length > 0 && (
                  <div>
                    <h3 className="font-semibold">{t('hints.diversityHeading')}</h3>
                    <ul className="mt-1 list-disc list-inside">
                      {coverage.hints.lowDiversitySections.map(hint => (
                        <li key={hint.sectionId}>
                          {t('hints.diversityItem', {
                            section: hint.sectionName,
                            type: hint.uniqueTypeName,
                            count: hint.sessionsInSection,
                          })}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}
          <section>
            <h2 className="mb-3 text-xl font-semibold">{t('coverage.perTypeHeading')}</h2>
            <div className="overflow-x-auto rounded border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left font-medium text-gray-700">
                      {t('coverage.colType')}
                    </th>
                    <th className="py-2 px-3 text-right font-medium text-gray-700">
                      {t('coverage.colAppearances')}
                    </th>
                    <th className="py-2 px-3 text-right font-medium text-gray-700">
                      {t('coverage.colUniqueDrills')}
                    </th>
                    <th className="py-2 px-3 text-right font-medium text-gray-700">
                      {t('coverage.colTypeOnly')}
                    </th>
                    <th className="py-2 px-3 text-left font-medium text-gray-700">
                      {t('coverage.colLastSeen')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {perType.map(type => (
                    <tr
                      key={type.id}
                      className={`border-t ${type.appearances === 0 ? 'text-gray-400' : ''}`}
                    >
                      <td className="py-2 px-3">
                        {type.name}
                        {type.appearances === 0 && (
                          <span className="ml-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                            {t('coverage.neverUsed')}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">{type.appearances}</td>
                      <td className="py-2 px-3 text-right">{type.uniqueExerciseCount}</td>
                      <td className="py-2 px-3 text-right">{type.fallbackOnlyCount}</td>
                      <td className="py-2 px-3">{formatDate(type.lastSeen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">{t('coverage.perSectionHeading')}</h2>
            <div className="space-y-4">
              {perSection.map(section => {
                const usedCount = section.types.filter(t => t.appearances > 0).length;
                const totalEligible = section.types.length;
                return (
                  <div key={section.id} className="rounded border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 flex items-center justify-between">
                      <h3 className="font-semibold">{section.name}</h3>
                      <span className="text-xs text-gray-600">
                        {t('coverage.sectionCoverageRatio', {
                          used: usedCount,
                          total: totalEligible,
                        })}
                      </span>
                    </div>
                    {section.types.length === 0 ? (
                      <p className="p-3 text-sm text-gray-500">{t('coverage.noEligibleTypes')}</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-3 text-left font-medium text-gray-700">
                              {t('coverage.colType')}
                            </th>
                            <th className="py-2 px-3 text-right font-medium text-gray-700">
                              {t('coverage.colAppearances')}
                            </th>
                            <th className="py-2 px-3 text-left font-medium text-gray-700">
                              {t('coverage.colLastSeen')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.types.map(type => (
                            <tr
                              key={type.id}
                              className={`border-t ${type.appearances === 0 ? 'text-gray-400' : ''}`}
                            >
                              <td className="py-2 px-3">
                                {type.name}
                                {type.appearances === 0 && (
                                  <span className="ml-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                                    {t('coverage.neverUsed')}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-right">{type.appearances}</td>
                              <td className="py-2 px-3">{formatDate(type.lastSeen)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
