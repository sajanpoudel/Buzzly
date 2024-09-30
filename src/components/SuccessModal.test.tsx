import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SuccessModal from './SuccessModal'

describe('SuccessModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<SuccessModal isOpen={false} onClose={vi.fn()} message="Saved" />)
    expect(container).toBeEmptyDOMElement()
  })
});
