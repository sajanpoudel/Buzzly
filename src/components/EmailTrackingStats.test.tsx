import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EmailTrackingStats from './EmailTrackingStats'

const stats = { totalSent: 200, totalOpened: 120, totalClicks: 30, uniqueOpens: 100 }

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('EmailTrackingStats', () => {
  it('does not call the api without tracking ids', () => {
    const fetchMock = mockFetch({ ok: true, json: async () => stats })
    render(<EmailTrackingStats trackingIds={[]} />)
    expect(fetchMock).not.toHaveBeenCalled()
  })
});
