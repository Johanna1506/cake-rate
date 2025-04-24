import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from '@jest/globals'

describe('Accessibility Tests', () => {
  it('should have proper ARIA labels', () => {
    render(
      <div>
        <button aria-label="Close">X</button>
        <input aria-label="Search" type="search" />
        <nav aria-label="Main navigation">
          <ul>
            <li><a href="/">Home</a></li>
          </ul>
        </nav>
      </div>
    )

    expect(screen.getByLabelText('Close')).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument()
  })

  it('should have proper heading structure', () => {
    render(
      <div>
        <h1>Main Title</h1>
        <section>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
        </section>
      </div>
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title')
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Section Title')
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Subsection Title')
  })

  it('should have proper form labels', () => {
    render(
      <form>
        <label htmlFor="username">Username</label>
        <input id="username" type="text" />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" />
      </form>
    )

    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('should have proper focus management', async () => {
    render(
      <div>
        <button>First</button>
        <button>Second</button>
        <button>Third</button>
      </div>
    )

    const buttons = screen.getAllByRole('button')
    await userEvent.tab()
    expect(buttons[0]).toHaveFocus()
    await userEvent.tab()
    expect(buttons[1]).toHaveFocus()
    await userEvent.tab()
    expect(buttons[2]).toHaveFocus()
  })
})