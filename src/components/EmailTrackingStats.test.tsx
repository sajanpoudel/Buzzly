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

  it('shows zeros before any data arrives', () => {
    mockFetch({ ok: true, json: async () => stats })
    render(<EmailTrackingStats trackingIds={[]} />)
    expect(screen.getByText('Total Sent').nextElementSibling).toHaveTextContent('0')
  })

  it('posts the tracking ids to the stats endpoint', async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => stats })
    render(<EmailTrackingStats trackingIds={['a', 'b']} />)
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/auth/email-stats')
    expect(JSON.parse(init.body)).toEqual({ trackingIds: ['a', 'b'] })
  })

  it('shows the totals from the api', async () => {
    mockFetch({ ok: true, json: async () => stats })
    render(<EmailTrackingStats trackingIds={['a']} />)
    await waitFor(() => expect(screen.getByText('200')).toBeInTheDocument())
    expect(screen.getByText('100')).toBeInTheDocument()
  })
});
