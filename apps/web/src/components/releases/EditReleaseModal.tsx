import React, { useState, useEffect } from 'react';
import { Release, ReleaseStatus, ProjectNature } from '@rmp/shared';
import { useUpdateRelease } from '../../hooks/useReleases';
import { Modal, Input, Textarea, DatePicker, Select, Button } from '../common/form';

interface EditReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  release: Release | null;
  onSuccess?: () => void;
}

export const EditReleaseModal: React.FC<EditReleaseModalProps> = ({
  isOpen,
  onClose,
  release,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [status, setStatus] = useState<ReleaseStatus>(ReleaseStatus.DRAFT);
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const updateMutation = useUpdateRelease(release?.id);

  const isMicroservices = release?.project?.nature === ProjectNature.MICROSERVICES;
  const projectServices = release?.project?.services || [];

  useEffect(() => {
    if (release) {
      setName(release.name || '');
      setVersion(release.version || '');
      setServiceName(release.serviceName || '');
      setStatus(release.status || ReleaseStatus.DRAFT);
      setTargetDate(
        release.targetDate ? new Date(release.targetDate).toISOString().split('T')[0] : '',
      );
      setDescription(release.description || '');
      setNotes(release.notes || '');
      setValidationError(null);
    }
  }, [release, isOpen]);

  if (!release) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation checks
    if (!name.trim()) {
      setValidationError('Release name is required.');
      return;
    }
    if (!version.trim()) {
      setValidationError('Version is required.');
      return;
    }
    const semverRegex = /^[vV]?[0-9]+\.[0-9]+(\.[0-9]+)?(-[a-zA-Z0-9.]+)?$/;
    if (!semverRegex.test(version.trim())) {
      setValidationError(
        'Version format is invalid. Must follow semver (e.g. v1.0.0, 2.1.0, v3.0.0-beta.1).',
      );
      return;
    }

    let parsedDate: string | undefined = undefined;
    if (targetDate) {
      const d = new Date(targetDate);
      if (isNaN(d.getTime())) {
        setValidationError('Target date is invalid.');
        return;
      }
      parsedDate = d.toISOString();
    }

    updateMutation.mutate(
      {
        id: release.id,
        name: name.trim(),
        version: version.trim(),
        serviceName: isMicroservices ? serviceName.trim() || undefined : undefined,
        status,
        targetDate: parsedDate,
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          if (onSuccess) onSuccess();
        },
      },
    );
  };

  const statusOptions = [
    { value: ReleaseStatus.DRAFT, label: 'Draft' },
    { value: ReleaseStatus.PLANNED, label: 'Planned' },
    { value: ReleaseStatus.IN_PROGRESS, label: 'In Progress' },
    { value: ReleaseStatus.READY_FOR_DEPLOYMENT, label: 'Ready for Deployment' },
    { value: ReleaseStatus.DEPLOYED, label: 'Deployed' },
    { value: ReleaseStatus.FAILED, label: 'Failed' },
    { value: ReleaseStatus.CANCELLED, label: 'Cancelled' },
  ];

  const serviceOptions = projectServices.map((s) => ({ value: s, label: s }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Release: ${release.name} (${release.version})`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={updateMutation.isPending}
            disabled={updateMutation.isPending || !name.trim() || !version.trim()}
          >
            Save Changes
          </Button>
        </>
      }
    >
      {(validationError || updateMutation.error) && (
        <div
          style={{
            padding: '0.65rem 0.85rem',
            backgroundColor: 'var(--status-error-bg)',
            color: 'var(--status-error-text)',
            border: '1px solid var(--status-error-border)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}
        >
          {validationError || updateMutation.error?.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
      >
        <Input
          label="Release Name"
          innerLabel={true}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input
            label="Version"
            innerLabel={true}
            required
            helper="e.g. v1.2.0"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />

          <Select
            label="Status"
            innerLabel={true}
            value={status}
            onChange={(val) => setStatus(val as ReleaseStatus)}
            options={statusOptions}
          />
        </div>

        {isMicroservices && (
          <div>
            {serviceOptions.length > 0 ? (
              <Select
                label="Target Service"
                innerLabel={true}
                value={serviceName}
                onChange={(val) => setServiceName(String(val))}
                options={serviceOptions}
              />
            ) : (
              <Input
                label="Target Service"
                innerLabel={true}
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
            )}
          </div>
        )}

        <DatePicker
          label="Target Date"
          innerLabel={true}
          value={targetDate}
          onChange={(date) => setTargetDate(date)}
        />

        <Textarea
          label="Description"
          innerLabel={true}
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Textarea
          label="Release Notes & Documentation"
          innerLabel={true}
          rows={4}
          placeholder="Deployment runbooks, rollback plans, changelogs, verification steps..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </form>
    </Modal>
  );
};
