import test, { beforeEach } from "node:test"
import assert from "node:assert/strict"

import {
  getCampaigns,
  saveCampaign,
  updateCampaignStats,
  type Campaign,
} from "../src/utils/campaignStore.ts"

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
    type: "email",
    subject: "Hello",
    body: "World",
    startDate: "2024-10-01",
    endDate: "2024-10-31",
    isRecurring: false,
    targetAudience: "everyone",
    recipients: [{ name: "Jane", email: "jane@example.com" }],
    status: "draft",
    stats: { sent: 0, opened: 0, clicked: 0, converted: 0 },
    trackingIds: [],
  }
}

beforeEach(() => storage.clear())

test("getCampaigns starts empty", () => {
  assert.deepEqual(getCampaigns(), [])
})

test("saveCampaign stores a campaign", () => {
  saveCampaign(campaign("1"))
  assert.equal(getCampaigns().length, 1)
  assert.equal(getCampaigns()[0].name, "Campaign 1")
})

test("saveCampaign keeps the order of saves", () => {
  saveCampaign(campaign("1"))
  saveCampaign(campaign("2"))
  assert.deepEqual(
    getCampaigns().map((c) => c.id),
    ["1", "2"]
  )
})

test("updateCampaignStats merges the new numbers", () => {
  saveCampaign(campaign("1"))
  updateCampaignStats("1", { opened: 5, clicked: 2, converted: 1 })
  assert.deepEqual(getCampaigns()[0].stats, { sent: 0, opened: 5, clicked: 2, converted: 1 })
})

test("updateCampaignStats ignores an unknown id", () => {
  saveCampaign(campaign("1"))
  updateCampaignStats("missing", { opened: 9, clicked: 9, converted: 9 })
  assert.equal(getCampaigns()[0].stats.opened, 0)
})

test("getCampaigns recovers from corrupted data", () => {
  storage.set("email_campaigns", "{not json")
  assert.deepEqual(getCampaigns(), [])
})
