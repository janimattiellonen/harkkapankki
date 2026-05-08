import { useEffect, useState } from 'react';
import { Form, useNavigation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type MDEditor from '@uiw/react-md-editor';
import { Button } from '~/components/Button';
import { retrospectiveFormSchema, type RetrospectiveFormInput } from '~/schemas/retrospective';

type SerializedRetrospective = {
  id: string;
  participantCount: number;
  summary: string;
  wentWell: string | null;
  improvements: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type RetrospectiveActionData = {
  intent: string | null;
  fieldErrors: Record<string, string>;
  formError?: string;
};

type RetrospectiveSectionProps = {
  retrospective: SerializedRetrospective | null | undefined;
  actionData?: RetrospectiveActionData;
};

const isRetrospectiveIntent = (intent: string | null | undefined) =>
  intent === 'retrospective-create' ||
  intent === 'retrospective-update' ||
  intent === 'retrospective-delete';

export function RetrospectiveSection({ retrospective, actionData }: RetrospectiveSectionProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const retroId = retrospective?.id ?? null;
  const retroUpdatedAt = retrospective?.updatedAt ?? null;

  // After a successful create/update/delete the action redirects back to
  // this same URL, so the component stays mounted and any local UI flags
  // would persist. Reset them whenever the retrospective's identity
  // changes (created, updated, or deleted). Validation failures don't
  // change identity, so the form correctly stays open with its errors.
  useEffect(() => {
    setIsEditing(false);
    setShowDeleteDialog(false);
  }, [retroId, retroUpdatedAt]);

  const hasRetro = Boolean(retrospective);
  const isCreating = !hasRetro && isEditing;
  const isUpdating = hasRetro && isEditing;

  const isSubmitting =
    navigation.state === 'submitting' &&
    isRetrospectiveIntent(navigation.formData?.get('intent') as string | null);
  const isDeleting =
    navigation.state === 'submitting' &&
    navigation.formData?.get('intent') === 'retrospective-delete';

  const showFieldErrors =
    actionData?.intent === 'retrospective-create' || actionData?.intent === 'retrospective-update';
  const showFormError = isRetrospectiveIntent(actionData?.intent ?? null);

  return (
    <section className="mt-10 border-t pt-8">
      <h2 className="text-xl font-semibold mb-4">{t('retrospective.title')}</h2>

      {showFormError && actionData?.formError ? (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {actionData.formError}
        </div>
      ) : null}

      {!hasRetro && !isCreating ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <p className="text-gray-600 mb-4">{t('retrospective.emptyHint')}</p>
          <Button type="button" onClick={() => setIsEditing(true)}>
            {t('retrospective.add')}
          </Button>
        </div>
      ) : null}

      {hasRetro && !isUpdating ? (
        <ReadView
          retrospective={retrospective!}
          onEdit={() => setIsEditing(true)}
          onDelete={() => setShowDeleteDialog(true)}
          isDeleting={isDeleting}
        />
      ) : null}

      {isEditing ? (
        <RetrospectiveForm
          retrospective={retrospective ?? null}
          fieldErrors={showFieldErrors ? (actionData?.fieldErrors ?? {}) : {}}
          isSubmitting={isSubmitting}
          onCancel={() => setIsEditing(false)}
        />
      ) : null}

      {showDeleteDialog && retrospective ? (
        <DeleteDialog
          retrospectiveId={retrospective.id}
          isDeleting={isDeleting}
          onCancel={() => setShowDeleteDialog(false)}
        />
      ) : null}
    </section>
  );
}

type ReadViewProps = {
  retrospective: SerializedRetrospective;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
};

function ReadView({ retrospective, onEdit, onDelete, isDeleting }: ReadViewProps) {
  const { t } = useTranslation();
  const [MarkdownComponent, setMarkdownComponent] = useState<typeof MDEditor.Markdown | null>(null);

  useEffect(() => {
    import('@uiw/react-md-editor').then(mod => {
      setMarkdownComponent(() => mod.default.Markdown);
    });
  }, []);

  const renderMarkdown = (text: string) =>
    MarkdownComponent ? (
      <MarkdownComponent source={text} />
    ) : (
      <div className="whitespace-pre-line">{text}</div>
    );

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{t('retrospective.participantCount')}</p>
          <p className="text-3xl font-semibold">{retrospective.participantCount}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onEdit} disabled={isDeleting}>
            {t('common.edit')}
          </Button>
          <Button type="button" variant="danger" onClick={onDelete} disabled={isDeleting}>
            {t('common.delete')}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('retrospective.summary')}</h3>
        <div className="[&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6">
          {renderMarkdown(retrospective.summary)}
        </div>
      </div>

      {retrospective.wentWell ? (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            {t('retrospective.wentWell')}
          </h3>
          <div className="[&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6">
            {renderMarkdown(retrospective.wentWell)}
          </div>
        </div>
      ) : null}

      {retrospective.improvements ? (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            {t('retrospective.improvements')}
          </h3>
          <div className="[&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6">
            {renderMarkdown(retrospective.improvements)}
          </div>
        </div>
      ) : null}
    </div>
  );
}

type RetrospectiveFormProps = {
  retrospective: SerializedRetrospective | null;
  fieldErrors: Record<string, string>;
  isSubmitting: boolean;
  onCancel: () => void;
};

function RetrospectiveForm({
  retrospective,
  fieldErrors,
  isSubmitting,
  onCancel,
}: RetrospectiveFormProps) {
  const { t } = useTranslation();
  const [MDEditorComponent, setMDEditorComponent] = useState<typeof MDEditor | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    import('@uiw/react-md-editor').then(mod => {
      setMDEditorComponent(() => mod.default);
    });
  }, []);

  const {
    register,
    control,
    formState: { errors },
    setError,
  } = useForm<RetrospectiveFormInput>({
    resolver: zodResolver(retrospectiveFormSchema),
    values: {
      participantCount: retrospective ? String(retrospective.participantCount) : '',
      summary: retrospective?.summary ?? '',
      wentWell: retrospective?.wentWell ?? '',
      improvements: retrospective?.improvements ?? '',
    },
  });

  useEffect(() => {
    Object.entries(fieldErrors).forEach(([field, message]) => {
      setError(field as keyof RetrospectiveFormInput, { type: 'server', message });
    });
  }, [fieldErrors, setError]);

  const intent = retrospective ? 'retrospective-update' : 'retrospective-create';
  const submitLabel = retrospective ? t('common.save') : t('retrospective.add');

  return (
    <Form method="post" className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <input type="hidden" name="intent" value={intent} />
      {retrospective ? (
        <input type="hidden" name="retrospectiveId" value={retrospective.id} />
      ) : null}

      <div>
        <label htmlFor="participantCount" className="block text-sm font-medium text-gray-700">
          {t('retrospective.participantCount')}
        </label>
        <input
          type="number"
          id="participantCount"
          min={0}
          max={100}
          step={1}
          {...register('participantCount')}
          className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.participantCount ? (
          <p className="mt-1 text-sm text-red-600">{errors.participantCount.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
          {t('retrospective.summary')}
        </label>
        <Controller
          name="summary"
          control={control}
          render={({ field: { onChange, value } }) => (
            <>
              <div key={mounted ? 'editor-summary' : 'textarea-summary'}>
                {mounted && MDEditorComponent ? (
                  <MDEditorComponent
                    value={value ?? ''}
                    onChange={val => onChange(val ?? '')}
                    preview="edit"
                    height={200}
                  />
                ) : (
                  <textarea
                    id="summary"
                    rows={4}
                    value={value ?? ''}
                    onChange={e => onChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
              </div>
              <input type="hidden" name="summary" value={value ?? ''} />
            </>
          )}
        />
        {errors.summary ? (
          <p className="mt-1 text-sm text-red-600">{errors.summary.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="wentWell" className="block text-sm font-medium text-gray-700 mb-2">
          {t('retrospective.wentWell')}
        </label>
        <Controller
          name="wentWell"
          control={control}
          render={({ field: { onChange, value } }) => (
            <>
              <div key={mounted ? 'editor-wentWell' : 'textarea-wentWell'}>
                {mounted && MDEditorComponent ? (
                  <MDEditorComponent
                    value={value ?? ''}
                    onChange={val => onChange(val ?? '')}
                    preview="edit"
                    height={200}
                  />
                ) : (
                  <textarea
                    id="wentWell"
                    rows={4}
                    value={value ?? ''}
                    onChange={e => onChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
              </div>
              <input type="hidden" name="wentWell" value={value ?? ''} />
            </>
          )}
        />
        {errors.wentWell ? (
          <p className="mt-1 text-sm text-red-600">{errors.wentWell.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="improvements" className="block text-sm font-medium text-gray-700 mb-2">
          {t('retrospective.improvements')}
        </label>
        <Controller
          name="improvements"
          control={control}
          render={({ field: { onChange, value } }) => (
            <>
              <div key={mounted ? 'editor-improvements' : 'textarea-improvements'}>
                {mounted && MDEditorComponent ? (
                  <MDEditorComponent
                    value={value ?? ''}
                    onChange={val => onChange(val ?? '')}
                    preview="edit"
                    height={200}
                  />
                ) : (
                  <textarea
                    id="improvements"
                    rows={4}
                    value={value ?? ''}
                    onChange={e => onChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
              </div>
              <input type="hidden" name="improvements" value={value ?? ''} />
            </>
          )}
        />
        {errors.improvements ? (
          <p className="mt-1 text-sm text-red-600">{errors.improvements.message}</p>
        ) : null}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </Form>
  );
}

type DeleteDialogProps = {
  retrospectiveId: string;
  isDeleting: boolean;
  onCancel: () => void;
};

function DeleteDialog({ retrospectiveId, isDeleting, onCancel }: DeleteDialogProps) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('retrospective.deleteTitle')}
        </h3>
        <p className="text-gray-600 mb-6">{t('retrospective.deleteConfirm')}</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isDeleting}>
            {t('common.cancel')}
          </Button>
          <Form method="post">
            <input type="hidden" name="intent" value="retrospective-delete" />
            <input type="hidden" name="retrospectiveId" value={retrospectiveId} />
            <Button type="submit" variant="danger" disabled={isDeleting}>
              {t('common.delete')}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
