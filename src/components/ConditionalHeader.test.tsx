import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ConditionalHeader from './ConditionalHeader'

let pathname = '/dashboard'
vi.mock('next/navigation', () => ({ usePathname: () => pathname }))

const storage = new Map<string, string>()

beforeEach(() => {
  pathname = '/dashboard'
  storage.clear()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
  })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('ConditionalHeader', () => {
  it('renders nothing on the login page', () => {
    pathname = '/'
    const { container } = render(<ConditionalHeader />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the app header on other pages', () => {
    render(<ConditionalHeader />)
    expect(screen.getByRole('heading', { name: 'Your App Name' })).toBeInTheDocument()
  })

  it('falls back to the letter U without a signed in user', () => {
    render(<ConditionalHeader />)
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('does not call the api without stored tokens', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<ConditionalHeader />)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('loads the user info and shows the initials of the email', async () => {
    storage.set('gmail_tokens', JSON.stringify({ access_token: 'x' }))
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ name: 'Jane Doe', email: 'jane.doe@example.com', picture: '' }),
      })
    )
    render(<ConditionalHeader />)
    await waitFor(() => expect(screen.getByText('JD')).toBeInTheDocument())
  })
});
