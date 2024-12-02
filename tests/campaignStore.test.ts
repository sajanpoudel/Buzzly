import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'

import {
  getCampaigns,
  saveCampaign,
  updateCampaignStats,
  type Campaign,
} from '../src/utils/campaignStore.ts'

// A minimal in memory localStorage, because the store runs in the browser.
const storage = new Map<string, string>()
;(globalThis as any).localStorage = {
  getItem: (key: string) => (storage.has(key) ? storage.get(key)! : null),
  setItem: (key: string, value: string) => void storage.set(key, value),
}

function campaign(id: string): Campaign {
  return {
    id,
    name: `Campaign ${id}`,
    type: 'email',
    subject: 'Hello',
    body: 'World',
    startDate: '2024-10-01',
    endDate: '2024-10-31',
    isRecurring: false,
    targetAudience: 'everyone',
    recipients: [{ name: 'Jane', email: 'jane@example.com' }],
    status: 'draft',
    stats: { sent: 0, opened: 0, clicked: 0, converted: 0 },
    trackingIds: [],
  }
}

beforeEach(() => storage.clear())
