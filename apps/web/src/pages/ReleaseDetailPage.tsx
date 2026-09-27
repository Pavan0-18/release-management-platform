import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Release, ReleaseStatus } from '@rmp/shared';
import { useRelease, useUpdateRelease, useDeleteRelease } from '../hooks/useReleases';
import { ReleaseStatusBadge } from '../components/releases/ReleaseStatusBadge';
import { ProgressBar } from '../components/releases/ProgressBar';
import { ReleaseChecklist } from '../components/releases/ReleaseChecklist';
import { AddStepModal } from '../components/releases/AddStepModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button, Select } from '../components/common/form';

export const ReleaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');

  const { data: release, isLoading, error, refetch } = useRelease(id);
  const updateMutation = useUpdateRelease(id);
  const deleteMutation = useDeleteRelease();

  // Sync notes text when release data arrives or changes
  React.useEffect(() => {
    if (release) {
      setNotesText(release.notes || '');
    }
  }, [release]);

  const handleStatusChange = (newStatus: ReleaseStatus) => {
    if (!id) return;
    updateMutation.mutate({
      id,
      status: newStatus,
    });
  };

  const handleSaveNotes = () => {
    if (!id) return;
    updateMutation.mutate(
      {
        id,
        notes: notesText.trim(),
      },
      {
        onSuccess: () => {
          setIsEditingNotes(false);
        },
      },
    );
  };

  const handleDeleteRelease = () => {
    if (!id) return;
    if (window.confirm(`Are you sure you want to delete release "${release?.name}"?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          navigate('/releases');
        },
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading release details..." />;
  }

  if (error || !release) {
    return (
      <div className="card" style={{ borderLeft: '4px solid var(--status-error-border)' }}>
        <h3 style={{ color: 'var(--status-error-text)', marginBottom: '0.5rem' }}>
          Release Not Found
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          {(error as Error)?.message || 'Could not locate the requested release record.'}
        </p>
        <Link to="/releases" className="btn btn-secondary">
          &larr; Back to Releases
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Breadcrumb & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          to={`/projects/${release.projectId}`}
          style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          &larr; Back to Releases
        </Link>

        <Button
          variant="danger"
          size="sm"
          onClick={handleDeleteRelease}
          loading={deleteMutation.isPending}
        >
          Delete Release
        </Button>
      </div>

      {/* Release Overview Header */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '0.35rem',
                flexWrap: 'wrap',
              }}
            >
              {release.project && (
                <Link
                  to={`/projects/${release.project.id}`}
                  title={`Project: ${release.project.name} (${release.project.key})`}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    textDecoration: 'none',
                  }}
                >
                  {release.project.key}
                </Link>
              )}

              {release.serviceName && (
                <span
                  title={`Target Service Component: ${release.serviceName}`}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #bae6fd',
                    fontFamily: 'monospace',
                  }}
                >
                  ⚙️ {release.serviceName}
                </span>
              )}

              <h2
                style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}
                title={`Release Name: ${release.name}`}
              >
                {release.name}
              </h2>
              <code
                title="Release Version"
                style={{
                  backgroundColor: 'var(--accent-light)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                  border: '1px solid #ebdcd0',
                }}
              >
                {release.version}
              </code>
            </div>
            {release.description && (
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  margin: '0.25rem 0 0 0',
                }}
              >
                {release.description}
              </p>
            )}
          </div>

          {/* Status Controls */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '0.4rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status:</span>
              <ReleaseStatusBadge status={release.status} />
            </div>

            <div style={{ width: '190px' }}>
              <Select
                label="Change Status"
                value={release.status}
                disabled={updateMutation.isPending}
                onChange={(val) => handleStatusChange(val as ReleaseStatus)}
                options={[
                  { value: ReleaseStatus.DRAFT, label: 'Draft' },
                  { value: ReleaseStatus.PLANNED, label: 'Planned' },
                  { value: ReleaseStatus.IN_PROGRESS, label: 'In Progress' },
                  { value: ReleaseStatus.READY_FOR_DEPLOYMENT, label: 'Ready for Deployment' },
                  { value: ReleaseStatus.DEPLOYED, label: 'Deployed' },
                  { value: ReleaseStatus.FAILED, label: 'Failed' },
                  { value: ReleaseStatus.CANCELLED, label: 'Cancelled' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Metadata Details */}
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            flexWrap: 'wrap',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '0.85rem',
            marginTop: '0.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Target Date:</strong>{' '}
            {release.targetDate ? new Date(release.targetDate).toLocaleDateString() : 'Unscheduled'}
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Created:</strong>{' '}
            {new Date(release.createdAt).toLocaleDateString()}
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Updated:</strong>{' '}
            {new Date(release.updatedAt).toLocaleTimeString()}
          </div>
        </div>

        {/* Progress Tracker */}
        <div style={{ marginTop: '1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.35rem',
            }}
          >
            <span>Verification Progress</span>
            <span>
              {release.completedSteps || 0} of {release.totalSteps || 0} steps completed (
              {release.progressPercentage || 0}%)
            </span>
          </div>
          <ProgressBar percentage={release.progressPercentage || 0} showText={false} />
        </div>
      </div>

      {/* Release Notes & Documentation Section */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '0.65rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              📝 Release Notes & Documentation
            </h3>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                margin: '0.15rem 0 0 0',
              }}
            >
              Add changelogs, rollback procedures, deployment instructions, or post-mortem notes.
            </p>
          </div>

          {isEditingNotes ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setNotesText(release.notes || '');
                  setIsEditingNotes(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={updateMutation.isPending}
                onClick={handleSaveNotes}
              >
                Save Notes
              </Button>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setIsEditingNotes(true)}>
              {release.notes ? '✏️ Edit Notes' : '+ Add Notes'}
            </Button>
          )}
        </div>

        {isEditingNotes ? (
          <div>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Enter release notes, deployment instructions, migration runbooks, rollback plans, or changelog highlights..."
              rows={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--accent-primary)',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                backgroundColor: '#ffffff',
                color: 'var(--text-primary)',
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'vertical',
              }}
              autoFocus
            />
          </div>
        ) : (
          <div style={{ minHeight: '48px' }}>
            {release.notes ? (
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.875rem',
                  lineHeight: 1.65,
                  color: 'var(--text-primary)',
                  backgroundColor: '#faf6f3',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #ebdcd0',
                }}
              >
                {release.notes}
              </div>
            ) : (
              <div
                style={{
                  padding: '1.25rem 0.5rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  backgroundColor: '#fafaf9',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--border-color)',
                }}
              >
                No notes or documentation attached to this release yet.{' '}
                <button
                  type="button"
                  onClick={() => setIsEditingNotes(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Click here to add notes
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Checklist Section */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '0.75rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Checklist Steps
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
              Verification gates required before release promotion
            </p>
          </div>

          <Button variant="primary" size="sm" onClick={() => setIsAddStepOpen(true)}>
            + Add Step
          </Button>
        </div>

        <ReleaseChecklist releaseId={release.id} steps={release.steps} />
      </div>

      {/* Add Step Modal */}
      <AddStepModal
        isOpen={isAddStepOpen}
        releaseId={release.id}
        onClose={() => setIsAddStepOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
