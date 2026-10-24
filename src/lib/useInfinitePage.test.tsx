import { act, cleanup, render, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { useInfinitePage, type InfinitePage } from './useInfinitePage'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

type Item = { id: string; read?: boolean }

const page = (items: Item[]): InfinitePage<Item, { id: string }> => ({
  items,
  hasMore: false,
  nextCursor: null,
})

describe('useInfinitePage', () => {
  test('merges refreshed first pages without duplicating already-loaded rows', async () => {
    const first = page([{ id: '1' }, { id: '2' }])
    const { result, rerender } = renderHook(
      ({ initialPage }) =>
        useInfinitePage({
          initialPage,
          fetchPage: async () => page([]),
          getKey: (item) => item.id,
        }),
      { initialProps: { initialPage: first } }
    )

    act(() => {
      result.current.setPage({
        ...first,
        items: [...first.items, { id: '3' }],
      })
    })

    rerender({ initialPage: page([{ id: '1', read: true }, { id: '2' }]) })

    await waitFor(() => {
      expect(result.current.page.items).toEqual([{ id: '1', read: true }, { id: '2' }, { id: '3' }])
    })
  })

  test('ignores stale reload responses', async () => {
    let resolveFirst: (value: InfinitePage<Item, { id: string }>) => void = () => {}
    let resolveSecond: (value: InfinitePage<Item, { id: string }>) => void = () => {}
    const first = new Promise<InfinitePage<Item, { id: string }>>((resolve) => {
      resolveFirst = resolve
    })
    const second = new Promise<InfinitePage<Item, { id: string }>>((resolve) => {
      resolveSecond = resolve
    })
    const initialPage = page([{ id: 'initial' }])
    const { result } = renderHook(() =>
      useInfinitePage({
        initialPage,
        fetchPage: async () => page([]),
        getKey: (item) => item.id,
      })
    )

    await act(async () => {
      result.current.reload(() => first)
      result.current.reload(() => second)
      resolveFirst(page([{ id: 'stale' }]))
      resolveSecond(page([{ id: 'fresh' }]))
    })

    expect(result.current.page.items).toEqual([{ id: 'fresh' }])
  })
})

test('retains results after a failed reload and retries the same request', async () => {
  const load = vi
    .fn()
    .mockRejectedValueOnce(new Error('private server detail'))
    .mockResolvedValueOnce(page([{ id: 'new' }]))
  const { result } = renderHook(() =>
    useInfinitePage({ initialPage: page([{ id: 'old' }]), fetchPage: load })
  )
  await act(async () => {
    result.current.reload(load)
  })
  expect(result.current.pending).toBe(false)
  expect(result.current.page.items).toEqual([{ id: 'old' }])
  expect(result.current.error).toBe(
    'Unable to update results. Your previous results are still shown.'
  )
  await act(async () => {
    result.current.retry()
  })
  expect(result.current.page.items).toEqual([{ id: 'new' }])
  expect(result.current.error).toBeNull()
  expect(load).toHaveBeenCalledTimes(2)
})

test('ignores a failed older request when the newest request succeeds', async () => {
  let rejectOld: (reason: Error) => void = () => {}
  const old = new Promise<InfinitePage<Item, { id: string }>>((_, reject) => {
    rejectOld = reject
  })
  const { result } = renderHook(() =>
    useInfinitePage({ initialPage: page([{ id: 'old' }]), fetchPage: async () => page([]) })
  )
  await act(async () => {
    result.current.reload(() => old)
    result.current.reload(async () => page([{ id: 'latest' }]))
    rejectOld(new Error('stale failure'))
  })
  expect(result.current.page.items).toEqual([{ id: 'latest' }])
  expect(result.current.error).toBeNull()
})

test('pauses automatic pagination after failure and retries without losing rows', async () => {
  let intersect: IntersectionObserverCallback = () => {}
  const observe = vi.fn()
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = callback
      }
      observe = observe
      disconnect = vi.fn()
    }
  )
  const fetchPage = vi
    .fn()
    .mockRejectedValueOnce(new Error('failed'))
    .mockResolvedValueOnce(page([{ id: 'next' }]))
  let state: ReturnType<typeof useInfinitePage<Item, { id: string }>>
  function List() {
    state = useInfinitePage({
      initialPage: { items: [{ id: 'first' }], hasMore: true, nextCursor: { id: 'first' } },
      fetchPage,
    })
    return <div ref={state.markerRef} />
  }
  render(<List />)
  await act(async () => {
    intersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
  })
  expect(fetchPage).toHaveBeenCalledTimes(1)
  expect(state!.pending).toBe(false)
  expect(state!.error).toContain('Unable to load more results')
  expect(observe).toHaveBeenCalledTimes(1)
  await act(async () => {
    state!.retry()
  })
  expect(state!.page.items).toEqual([{ id: 'first' }, { id: 'next' }])
  expect(state!.error).toBeNull()
  expect(fetchPage).toHaveBeenCalledTimes(2)
})
