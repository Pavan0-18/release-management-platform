import React, { useState } from 'react';
import { Project } from '@rmp/shared';
import { useUpdateProject } from '../../hooks/useProjects';
import { Modal, Input, Button } from '../common/form';
import { useToast } from '../common/toast';

interface ManageServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ManageServicesModal: React.FC<ManageServicesModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [newServiceName, setNewServiceName] = useState('');
  const [services, setServices] = useState<string[]>(project.services || []);
  const [error, setError] = useState<string | null>(null);

  const updateProjectMutation = useUpdateProject(project.id);
  const toast = useToast();

  // Keep local state in sync when modal opens or project changes
  React.useEffect(() => {
    if (isOpen) {
      setServices(project.services || []);
      setNewServiceName('');
      setError(null);
    }
  }, [isOpen, project.services]);

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newServiceName.trim().toLowerCase();

    if (!trimmed) {
      setError('Service name cannot be empty');
      return;
    }

    if (!/^[a-z0-9-_]+$/.test(trimmed)) {
      setError('Service name can only contain lowercase letters, numbers, hyphens and underscores');
      return;
    }

    if (services.includes(trimmed)) {
      setError(`Service "${trimmed}" already exists in this project`);
      return;
    }

    const updated = [...services, trimmed];
    setServices(updated);
    setNewServiceName('');
    setError(null);

    // Persist immediately to backend
    updateProjectMutation.mutate(
      {
        id: project.id,
        services: updated,
      },
      {
        onSuccess: () => {
          toast.success('Service Added', `Added "${trimmed}" to ${project.name}.`);
        },
      },
    );
  };

  const handleRemoveService = (serviceToRemove: string) => {
    const updated = services.filter((s) => s !== serviceToRemove);
    setServices(updated);

    // Persist immediately to backend
    updateProjectMutation.mutate(
      {
        id: project.id,
        services: updated,
      },
      {
        onSuccess: () => {
          toast.info('Service Removed', `Removed "${serviceToRemove}" from ${project.name}.`);
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Microservices: ${project.name}`}
      maxWidth="540px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p
          style={{
            margin: 0,
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
          }}
        >
          Microservices projects track independent releases, versioning, and verification gates per
          service. Add new services at any time.
        </p>

        {/* Add Service Form */}
        <form
          onSubmit={handleAddService}
          style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-start',
            backgroundColor: '#faf7f2',
            padding: '0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ flex: 1 }}>
            <Input
              label="New service name (e.g. payment-worker)"
              innerLabel={true}
              value={newServiceName}
              onChange={(e) => {
                setNewServiceName(e.target.value);
                if (error) setError(null);
              }}
              error={error || undefined}
              disabled={updateProjectMutation.isPending}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            loading={updateProjectMutation.isPending}
            style={{ height: '44px', flexShrink: 0 }}
          >
            + Add Service
          </Button>
        </form>

        {/* Current Services List */}
        <div>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.5rem',
            }}
          >
            Configured Services ({services.length})
          </div>

          {services.length === 0 ? (
            <div
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: '#ffffff',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
              }}
            >
              No microservices configured yet. Add your first service above.
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                maxHeight: '260px',
                overflowY: 'auto',
              }}
            >
              {services.map((svc) => (
                <div
                  key={svc}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-primary)',
                      }}
                    />
                    <span
                      style={{
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {svc}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveService(svc)}
                    disabled={updateProjectMutation.isPending}
                    style={{
                      color: '#dc2626',
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.75rem',
                      height: '28px',
                    }}
                    title={`Remove ${svc}`}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <Button variant="secondary" onClick={onClose} style={{ height: '40px' }}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
