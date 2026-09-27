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
    return <LoadingSpinner message="Loading release checklist..." />;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Breadcrumb & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          to="/releases"
          style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          &larr; Back to Releases
        </Link>

        <button
          onClick={handleDeleteRelease}
          disabled={deleting}
          className="btn btn-secondary"
          style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', fontSize: '0.85rem' }}
        >
          {deleting ? 'Deleting...' : 'Delete Release'}
        </button>
      </div>

      {/* Release Overview Card */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.5rem',
              }}
            >
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{release.name}</h2>
              <code
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                }}
              >
                {release.version}
              </code>
            </div>
            {release.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {release.description}
              </p>
            )}
          </div>

          {/* Status Control */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status:</span>
              <ReleaseStatusBadge status={release.status} />
            </div>

            <select
              value={release.status}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value as ReleaseStatus)}
              style={{
                padding: '0.4rem 0.75rem',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <option value={ReleaseStatus.DRAFT}>Draft</option>
              <option value={ReleaseStatus.PLANNED}>Planned</option>
              <option value={ReleaseStatus.IN_PROGRESS}>In Progress</option>
              <option value={ReleaseStatus.READY_FOR_DEPLOYMENT}>Ready for Deployment</option>
              <option value={ReleaseStatus.DEPLOYED}>Deployed</option>
              <option value={ReleaseStatus.FAILED}>Failed</option>
              <option value={ReleaseStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </div>

        {/* Target Date & Metadata */}
        <div
          style={{
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1rem',
            marginTop: '0.5rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div>
            <strong>Target Date:</strong>{' '}
            {release.targetDate ? new Date(release.targetDate).toLocaleDateString() : 'Unscheduled'}
          </div>
          <div>
            <strong>Created:</strong> {new Date(release.createdAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Last Updated:</strong> {new Date(release.updatedAt).toLocaleTimeString()}
          </div>
        </div>

        {/* Overall Checklist Progress */}
        <div style={{ marginTop: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.4rem',
            }}
          >
            <span>Release Checklist Verification</span>
            <span>
              {release.completedSteps || 0} / {release.totalSteps || 0} Steps Verified (
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
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Verification Checklist Steps</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Ensure all required gates and verifications are marked completed prior to production
              promotion.
            </p>
          </div>

          <button
            onClick={() => setIsAddStepOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            + Add Step
          </button>
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
