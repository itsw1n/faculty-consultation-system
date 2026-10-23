import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { useInfinitePage, type InfinitePage } from './useInfinitePage'

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
