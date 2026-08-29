import { useEffect, useMemo, useRef, useState } from 'react';
import type { MemePost } from '../types';
import {
  localForYou,
  localSearch,
  orderByHits,
  ragAvailable,
  recommendForYou,
  semanticSearch,
} from '../lib/rag';

/** How the results on screen were produced -- surfaced so the UI can say so. */
export type RagMode = 'idle' | 'semantic' | 'local' | 'loading';

const SEARCH_DEBOUNCE_MS = 250;

export interface SemanticSearchState {
  results: MemePost[];
  mode: RagMode;
}

/**
 * Debounced semantic search with a local substring fallback.
 *
 * Falls back whenever the backend is unreachable or the index is empty, so the
 * search box behaves exactly as it did before RAG existed rather than going blank.
 */
export function useSemanticSearch(
  memes: MemePost[],
  query: string,
  category?: string,
  /** Pulls retrieved memes that the paginated feed has not loaded yet. */
  onEnsureLoaded?: (memeIds: string[]) => void
): SemanticSearchState {
  const trimmed = query.trim();
  const [hitIds, setHitIds] = useState<string[] | null>(null);
  const [mode, setMode] = useState<RagMode>('idle');

  useEffect(() => {
    if (!trimmed) {
      setHitIds(null);
      setMode('idle');
      return;
    }

    if (!ragAvailable) {
      setHitIds(null);
      setMode('local');
      return;
    }

    let cancelled = false;
    setMode('loading');

    const timer = setTimeout(() => {
      semanticSearch({ query: trimmed, category, limit: 30 })
        .then((response) => {
          if (cancelled) return;
          if (response.indexSize === 0) {
            // Nothing indexed yet: a semantic miss would look like "no results".
            setHitIds(null);
            setMode('local');
            return;
          }
          const ids = response.results.map((hit) => hit.memeId);
          setHitIds(ids);
          setMode('semantic');
          onEnsureLoaded?.(ids);
        })
        .catch(() => {
          if (cancelled) return;
          setHitIds(null);
          setMode('local');
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed, category]);

  const results = useMemo(() => {
    if (!trimmed) return memes;
    if (hitIds === null) return localSearch(memes, trimmed);
    return orderByHits(
      memes,
      hitIds.map((memeId) => ({
        memeId,
        score: 0,
        caption: '',
        category: '',
        hashtags: [],
        creatorId: '',
      }))
    );
  }, [memes, trimmed, hitIds]);

  return { results, mode };
}

export interface ForYouState {
  results: MemePost[];
  /** 'taste' once the backend has enough signal, 'cold-start' or 'local' otherwise. */
  strategy: 'taste' | 'cold-start' | 'local';
  loading: boolean;
}

/**
 * The personalised "For You" ordering.
 *
 * Recommended memes come first, then everything else by virality, so the feed is
 * always full even when the index only covers part of the loaded page.
 */
export function useForYouFeed(
  memes: MemePost[],
  enabled: boolean,
  category?: string,
  /** Pulls recommended memes that the paginated feed has not loaded yet. */
  onEnsureLoaded?: (memeIds: string[]) => void
): ForYouState {
  const [recommendedIds, setRecommendedIds] = useState<string[] | null>(null);
  const [strategy, setStrategy] = useState<ForYouState['strategy']>('local');
  const [loading, setLoading] = useState(false);
  // Records the request we have already attempted, successful or not. Keying on
  // the attempt rather than the result is what stops a failed call from
  // re-firing on every render.
  const attemptedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !ragAvailable) {
      setRecommendedIds(null);
      setStrategy('local');
      attemptedKeyRef.current = null;
      return;
    }

    // Recommendations depend on the signed-in user and category, not on every
    // like that streams in -- refetching on each meme update would thrash.
    const key = category ?? '';
    if (attemptedKeyRef.current === key) return;
    attemptedKeyRef.current = key;

    let cancelled = false;
    setLoading(true);

    recommendForYou({ category, limit: 30 })
      .then((response) => {
        if (cancelled) return;
        const ids = response.results.map((hit) => hit.memeId);
        setRecommendedIds(ids);
        setStrategy(response.strategy);
        onEnsureLoaded?.(ids);
      })
      .catch(() => {
        if (cancelled) return;
        setRecommendedIds(null);
        setStrategy('local');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, category]);

  const results = useMemo(() => {
    if (recommendedIds === null) return localForYou(memes);

    const rank = new Map<string, number>(
      recommendedIds.map((id, index): [string, number] => [id, index])
    );
    const recommended = memes.filter((meme) => rank.has(meme.id));
    recommended.sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);

    const rest = localForYou(memes.filter((meme) => !rank.has(meme.id)));
    return [...recommended, ...rest];
  }, [memes, recommendedIds]);

  return { results, strategy, loading };
}
