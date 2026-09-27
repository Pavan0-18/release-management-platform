import React, { useState, useEffect } from 'react';
import { ProjectNature } from '@rmp/shared';
import { useProjects } from '../../hooks/useProjects';
import { useCreateRelease } from '../../hooks/useReleases';
import { Modal, Input, Textarea, DatePicker, Select, Button } from '../common/form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultServiceName?: string;
  onSuccess?: (releaseId: string) => void;
}

export const CreateReleaseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultProjectId,
  defaultServiceName,
  onSuccess,
}) => {
  const { data: projects = [] } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectId || '');
  const [selectedService, setSelectedService] = useState<string>(defaultServiceName || '');
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [checklistItems, setChecklistItems] = useState<
    Array<{ title: string; description?: string; isRequired: boolean }>
  >([]);
  const [newStepText, setNewStepText] = useState('');

  const createMutation = useCreateRelease();

  const currentProject = projects.find((p) => p.id === selectedProjectId);
  const isMicroservices = currentProject?.nature === ProjectNature.MICROSERVICES;
  const projectServices = currentProject?.services || [];

  // Set default project if only one exists or default is passed
  useEffect(() => {
    if (defaultProjectId) {
      setSelectedProjectId(defaultProjectId);
    } else if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [defaultProjectId, projects, selectedProjectId]);

  useEffect(() => {
    if (defaultServiceName) {
      setSelectedService(defaultServiceName);
    } else if (isMicroservices && projectServices.length > 0 && !selectedService) {
      setSelectedService(projectServices[0]);
    }
  }, [defaultServiceName, isMicroservices, projectServices, selectedService]);

  // When selected project changes, auto-populate checklist from project template
  useEffect(() => {
    if (!selectedProjectId) return;
    const project = projects.find((p) => p.id === selectedProjectId);
    if (project && project.defaultChecklist && project.defaultChecklist.length > 0) {
      setChecklistItems(
        project.defaultChecklist.map((item) => ({
          title: item.title,
          description: item.description || undefined,
          isRequired: item.isRequired !== undefined ? item.isRequired : true,
        })),
      );
    } else {
      setChecklistItems([
        { title: 'Automated test suite passing', isRequired: true },
        { title: 'Staging environment validation', isRequired: true },
      ]);
    }
  }, [selectedProjectId, projects]);

  const handleAddInlineStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStepText.trim()) {
      setChecklistItems([
        ...checklistItems,
        {
          title: newStepText.trim(),
          isRequired: true,
        },
      ]);
      setNewStepText('');
    }
  };

  const handleRemoveInlineStep = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !name.trim() || !version.trim()) return;

    createMutation.mutate(
      {
        projectId: selectedProjectId,
        serviceName: isMicroservices ? selectedService || undefined : undefined,
        name: name.trim(),
        version: version.trim(),
        description: description.trim() || undefined,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
        steps: checklistItems.map((item) => ({
          title: item.title,
          description: item.description,
          isRequired: item.isRequired,
        })),
      },
      {
        onSuccess: (newRelease) => {
          setName('');
          setVersion('');
          setDescription('');
          setTargetDate('');
          setSelectedService('');
          onClose();
          if (onSuccess) onSuccess(newRelease.id);
        },
      },
    );
  };

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: `${p.name} [${p.key}]${p.nature === ProjectNature.MICROSERVICES ? ' (Microservices)' : ''}`,
  }));

  const serviceOptions = [...projectServices.map((s) => ({ value: s, label: s }))];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Release"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={createMutation.isPending}
            disabled={
              createMutation.isPending || !selectedProjectId || !name.trim() || !version.trim()
            }
          >
            Create Release
          </Button>
        </>
      }
    >
      {createMutation.error && (
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
          {createMutation.error.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
      >
        {/* Project Selector */}
        <Select
          label="Target Project"
          innerLabel={true}
          required
          value={selectedProjectId}
          onChange={(val) => {
            setSelectedProjectId(String(val));
            setSelectedService('');
          }}
          options={projectOptions}
        />

        {/* If Microservices project: Target Service dropdown */}
        {isMicroservices && (
          <div>
            {serviceOptions.length > 0 ? (
              <Select
                label="Target Service"
                innerLabel={true}
                required
                value={selectedService}
                onChange={(val) => setSelectedService(String(val))}
                options={serviceOptions}
                placeholder="Select service..."
              />
            ) : (
              <Input
                label="Target Service Name"
                innerLabel={true}
                required
                placeholder="e.g. auth-service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              />
            )}
          </div>
        )}

        <Input
          label="Release Name"
          innerLabel={true}
          required
          placeholder="e.g. Auth Token Rotation & Security Patch"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input
            label="Version"
            innerLabel={true}
            required
            helper="e.g. v1.2.0"
            placeholder="v1.0.0"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />

          <DatePicker
            label="Target Date"
            innerLabel={true}
            value={targetDate}
            onChange={(date) => setTargetDate(date)}
          />
        </div>

        <Textarea
          label="Description"
          innerLabel={true}
          rows={2}
          placeholder="Summary of deployment notes..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Verification Checklist Steps */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            marginTop: '0.25rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.65rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Checklist ({checklistItems.length})
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Auto-loaded from template
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
              maxHeight: '130px',
              overflowY: 'auto',
              marginBottom: '0.35rem',
            }}
          >
            {checklistItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.6rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>✓</span>
                  <span>{item.title}</span>
                  {item.isRequired && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        padding: '0.05rem 0.3rem',
                        backgroundColor: 'var(--accent-light)',
                        color: 'var(--accent-primary)',
                        borderRadius: '3px',
                      }}
                    >
                      Mandatory
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveInlineStep(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add custom inline step */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Add extra verification item"
                innerLabel={true}
                placeholder="e.g. Verify rate limiter configuration"
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInlineStep(e);
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddInlineStep}
              style={{ height: '44px' }}
            >
              Add
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
