'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'

export type InfinitePage<TItem, TCursor> = {
  items: TItem[]
  hasMore: boolean
  nextCursor: TCursor | null
}

type UseInfinitePage<TItem, TCursor> = {
  page: InfinitePage<TItem, TCursor>
  setPage: Dispatch<SetStateAction<InfinitePage<TItem, TCursor>>>
  reload: (load: () => Promise<InfinitePage<TItem, TCursor>>) => void
  pending: boolean
  markerRef: RefObject<HTMLDivElement | null>
}

export function useInfinitePage<TItem, TCursor>({
  initialPage,
  fetchPage,
}: {
  initialPage: InfinitePage<TItem, TCursor>
  fetchPage: (cursor: TCursor) => Promise<InfinitePage<TItem, TCursor>>
}): UseInfinitePage<TItem, TCursor> {
  const [page, setPage] = useState(initialPage)
  const [pending, startTransition] = useTransition()
  const markerRef = useRef<HTMLDivElement>(null)
  const fetchRef = useRef(fetchPage)

  useEffect(() => {
    fetchRef.current = fetchPage
  })

  const reload = useCallback((load: () => Promise<InfinitePage<TItem, TCursor>>) => {
    startTransition(async () => {
      setPage(await load())
    })
  }, [])

  useEffect(() => {
    const node = markerRef.current
    const cursor = page.nextCursor
    if (!node || pending || !page.hasMore || !cursor) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        startTransition(async () => {
          const next = await fetchRef.current(cursor)
          setPage((current) => ({ ...next, items: [...current.items, ...next.items] }))
        })
      },
      { rootMargin: '200px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [page, pending])

  return { page, setPage, reload, pending, markerRef }
}
