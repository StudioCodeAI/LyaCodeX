export type SkillPermission = 'none' | 'read' | 'write' | 'deny' | 'ask' | 'allow';

export interface SkillManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  author: string;
  permissions: {
    filesystem: SkillPermission;
    shell: SkillPermission;
    network: SkillPermission;
  };
  triggers: string[];
  inputs: string[];
  outputs: string[];
}

export function validateSkillManifest(manifest: SkillManifest) {
  const errors: string[] = [];

  if (!manifest.id) errors.push('Skill id is required.');
  if (!manifest.name) errors.push('Skill name is required.');
  if (!manifest.version) errors.push('Skill version is required.');
  if (!manifest.category) errors.push('Skill category is required.');
  if (manifest.triggers.length === 0) errors.push('At least one trigger is required.');

  return {
    valid: errors.length === 0,
    errors,
  };
}

