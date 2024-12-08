import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import SuccessModal from "./SuccessModal"

describe("SuccessModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<SuccessModal isOpen={false} onClose={vi.fn()} message="Saved" />)
    expect(container).toBeEmptyDOMElement()
  })

  it("shows the message when open", () => {
    render(<SuccessModal isOpen onClose={vi.fn()} message="Campaign created" />)
    expect(screen.getByText("Campaign created")).toBeInTheDocument()
  })

  it("has a Success heading", () => {
    render(<SuccessModal isOpen onClose={vi.fn()} message="Saved" />)
    expect(screen.getByRole("heading", { name: "Success!" })).toBeInTheDocument()
  })

  it("calls onClose from the Close button", () => {
    const onClose = vi.fn()
    render(<SuccessModal isOpen onClose={onClose} message="Saved" />)
    fireEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("covers the page with a dimmed overlay", () => {
    const { container } = render(<SuccessModal isOpen onClose={vi.fn()} message="Saved" />)
    expect(container.firstChild).toHaveClass("fixed", "inset-0", "z-50")
  })
})
