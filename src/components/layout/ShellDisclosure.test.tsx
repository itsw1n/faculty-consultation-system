import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { ShellDisclosure } from './ShellDisclosure'
const route = vi.hoisted(() => ({ pathname: '/faculty' }))
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }))
afterEach(cleanup)
test('Escape closes the menu and returns focus to its trigger', () => {
  render(
    <ShellDisclosure>
      <summary>Open navigation</summary>
      <a href="/faculty/requests">Requests</a>
    </ShellDisclosure>
  )
  const trigger = screen.getByText('Open navigation')
  const details = trigger.closest('details')!
  details.open = true
  screen.getByText('Requests').focus()
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(details.open).toBe(false)
  expect(trigger).toHaveFocus()
})
test('outside pointer and navigation selection dismiss the menu', () => {
  render(
    <ShellDisclosure>
      <summary>Open navigation</summary>
      <a href="/faculty/requests" onClick={(e) => e.preventDefault()}>
        Requests
      </a>
    </ShellDisclosure>
  )
  const details = screen.getByText('Open navigation').closest('details')!
  details.open = true
  fireEvent.pointerDown(document.body)
  expect(details.open).toBe(false)
  details.open = true
  fireEvent.click(screen.getByText('Requests'))
  expect(details.open).toBe(false)
})

test('preserves an initially open native disclosure and dismisses it on route changes', () => {
  const menu = (
    <ShellDisclosure open>
      <summary>Menu</summary>
      <a href="/faculty/requests">Requests</a>
    </ShellDisclosure>
  )
  const { rerender } = render(menu)
  const details = screen.getByText('Menu').closest('details')!
  expect(details.open).toBe(true)
  route.pathname = '/faculty/requests'
  rerender(
    <ShellDisclosure open>
      <summary>Menu</summary>
      <a href="/faculty/requests">Requests</a>
    </ShellDisclosure>
  )
  expect(details.open).toBe(false)
  route.pathname = '/faculty'
})
