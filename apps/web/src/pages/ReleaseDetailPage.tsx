import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Release, ReleaseStatus } from '@rmp/shared';
import {
  DELETE_RELEASE,
  GET_RELEASE,
  GET_RELEASES,
  UPDATE_RELEASE,
} from '../graphql/releases.queries';
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

  const { data, loading, error, refetch } = useQuery(GET_RELEASE, {
    variables: { id: id! },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  const [updateRelease, { loading: updating }] = useMutation(UPDATE_RELEASE, {
    refetchQueries: [{ query: GET_RELEASE, variables: { id } }, { query: GET_RELEASES }],
  });

  const [deleteRelease, { loading: deleting }] = useMutation(DELETE_RELEASE, {
    refetchQueries: [{ query: GET_RELEASES }],
    onCompleted: () => {
      navigate('/releases');
    },
  });

  const release: Release | undefined = data?.release;

  const handleStatusChange = (newStatus: ReleaseStatus) => {
    if (!id) return;
    updateRelease({
      variables: {
        input: {
          id,
          status: newStatus,
        },
      },
    });
  };

  const handleDeleteRelease = () => {
    if (!id) return;
    if (window.confirm(`Are you sure you want to delete release "${release?.name}"?`)) {
      deleteRelease({ variables: { id } });
    }
  };

  if (loading && !data) {
    return <LoadingSpinner message="Loading release details..." />;
  }

  if (error || !release) {
    return (
      <div className="card" style={{ borderLeft: '4px solid var(--status-error-border)' }}>
        <h3 style={{ color: 'var(--status-error-text)', marginBottom: '0.5rem' }}>
          Release Not Found
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          {error?.message || 'Could not locate the requested release record.'}
        </p>
        <Link to="/releases" className="btn btn-secondary">
          &larr; Back to Releases
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Breadcrumb & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          to="/releases"
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

        <Button variant="danger" size="sm" onClick={handleDeleteRelease} loading={deleting}>
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
              }}
            >
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {release.name}
              </h2>
              <code
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
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
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

            <div style={{ width: '180px' }}>
              <Select
                value={release.status}
                disabled={updating}
                onChange={(e) => handleStatusChange(e.target.value as ReleaseStatus)}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
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
