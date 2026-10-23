'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
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

function mergePage<TItem, TCursor>(
  fresh: InfinitePage<TItem, TCursor>,
  current: InfinitePage<TItem, TCursor>,
  getKey: (item: TItem) => string | number
): InfinitePage<TItem, TCursor> {
  const freshKeys = new Set(fresh.items.map(getKey))
  return {
    ...fresh,
    items: [...fresh.items, ...current.items.filter((item) => !freshKeys.has(getKey(item)))],
  }
}

export function useInfinitePage<TItem, TCursor>({
  initialPage,
  fetchPage,
  getKey,
}: {
  initialPage: InfinitePage<TItem, TCursor>
  fetchPage: (cursor: TCursor) => Promise<InfinitePage<TItem, TCursor>>
  getKey?: (item: TItem) => string | number
}): UseInfinitePage<TItem, TCursor> {
  const [page, setPage] = useState(initialPage)
  const [pending, setPending] = useState(false)
  const markerRef = useRef<HTMLDivElement>(null)
  const fetchRef = useRef(fetchPage)
  const getKeyRef = useRef(getKey)
  const initialRef = useRef(JSON.stringify(initialPage))
  const generation = useRef(0)
  const loading = useRef(false)

  useEffect(() => {
    fetchRef.current = fetchPage
    getKeyRef.current = getKey
  })

  useEffect(() => {
    const serialized = JSON.stringify(initialPage)
    if (serialized === initialRef.current) return
    initialRef.current = serialized
    generation.current += 1
    loading.current = false
    setPage((current) => {
      const key = getKeyRef.current
      return key ? mergePage(initialPage, current, key) : initialPage
    })
  }, [initialPage])

  const reload = useCallback((load: () => Promise<InfinitePage<TItem, TCursor>>) => {
    const requestGeneration = ++generation.current
    loading.current = false
    setPending(true)
    void load()
      .then((next) => {
        if (requestGeneration === generation.current) setPage(next)
      })
      .finally(() => {
        if (requestGeneration === generation.current) setPending(false)
      })
  }, [])

  useEffect(() => {
    const node = markerRef.current
    const cursor = page.nextCursor
    if (!node || pending || !page.hasMore || !cursor) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loading.current) return
        loading.current = true
        setPending(true)
        const requestGeneration = generation.current
        void fetchRef
          .current(cursor)
          .then((next) => {
            if (requestGeneration !== generation.current) return
            setPage((current) => {
              const key = getKeyRef.current
              return key
                ? mergePage(next, current, key)
                : { ...next, items: [...current.items, ...next.items] }
            })
          })
          .finally(() => {
            if (requestGeneration === generation.current) {
              loading.current = false
              setPending(false)
            }
          })
      },
      { rootMargin: '200px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [page, pending])

  return { page, setPage, reload, pending, markerRef }
}
