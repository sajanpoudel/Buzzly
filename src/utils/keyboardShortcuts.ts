import React from 'react';

export interface ShortcutAction {
  action: () => void;
  description: string;
}

export const SHORTCUTS: Record<string, ShortcutAction> = {
  'cmd+t': {
    action: () => {
      // This will be implemented in the component
    },
    description: 'Create a new campaign',
  },
  'cmd+u': {
    action: () => {
      // This will be implemented in the component
    },
    description: 'Create a new template',
  },
  'cmd+e': {
    action: () => {
      // This will be implemented in the component
    },
    description: 'Create a new email',
  },
  'cmd+k': {
    action: () => {
      // This will be implemented in the component
    },
    description: 'Open command palette',
  },
  'cmd+m': {
    action: () => {
      // This will be implemented in the component
    },
    description: 'Send money with Checkbook',
  },
  'esc': {
    action: () => {
      // This will be implemented in the component
    },
    description: 'Cancel current action',
  },
};

export const handleKeyboardShortcut = (
  event: React.KeyboardEvent<Element>,
  actions: Record<string, () => void>
) => {
  const { key, metaKey, ctrlKey } = event;
  const cmd = metaKey || ctrlKey;

  if (cmd && key === 't') {
    event.preventDefault();
    actions['cmd+t']();
  } else if (cmd && key === 'u') {
    event.preventDefault();
    actions['cmd+u']();
  } else if (cmd && key === 'e') {
    event.preventDefault();
    actions['cmd+e']();
  } else if (cmd && key === 'k') {
    event.preventDefault();
    actions['cmd+k']();
  } else if (cmd && key === 'm') {
    event.preventDefault();
    actions['cmd+m']();
  } else if (key === 'Escape') {
    event.preventDefault();
    actions['esc']();
  }
};

export const getShortcutDescriptions = (): Record<string, string> => {
  return Object.entries(SHORTCUTS).reduce((acc, [key, { description }]) => {
    acc[key] = description;
    return acc;
  }, {} as Record<string, string>);
};