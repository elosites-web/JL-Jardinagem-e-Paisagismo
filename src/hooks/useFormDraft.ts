import { useCallback, useEffect, useRef, useState } from 'react';

export type FormDraftStatus = 'idle' | 'saving' | 'saved' | 'restored';

export interface DeserializeDraftOutcome<TData> {
  status: 'empty' | 'corrupted' | 'expired' | 'valid';
  data?: TData;
}

interface UseFormDraftOptions<TState, TData> {
  storageKey: string;
  value: TState;
  isEmpty: (state: TState) => boolean;
  serialize: (state: TState, nowMs: number) => string;
  deserialize: (rawJson: string | null, nowMs: number) => DeserializeDraftOutcome<TData>;
  onRestore: (data: TData) => void;
  debounceMs?: number;
}

export interface UseFormDraftReturn {
  draftStatus: FormDraftStatus;
  storageAvailable: boolean;
  saveNow: () => void;
  clearDraft: () => void;
}

function getSessionStorageSafe(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function useFormDraft<TState, TData>({
  storageKey,
  value,
  isEmpty,
  serialize,
  deserialize,
  onRestore,
  debounceMs = 400,
}: UseFormDraftOptions<TState, TData>): UseFormDraftReturn {
  const [draftStatus, setDraftStatus] = useState<FormDraftStatus>('idle');
  const [storageAvailable, setStorageAvailable] = useState(true);

  const latestValueRef = useRef(value);
  latestValueRef.current = value;

  const isEmptyRef = useRef(isEmpty);
  isEmptyRef.current = isEmpty;

  const serializeRef = useRef(serialize);
  serializeRef.current = serialize;

  const deserializeRef = useRef(deserialize);
  deserializeRef.current = deserialize;

  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;

  const hasMountedRef = useRef(false);
  const restoredPendingRef = useRef(false);
  const prevValueRef = useRef<TState>(value);
  const lastSavedValueRef = useRef<TState | null>(value);
  const debounceTimerRef = useRef<number | null>(null);

  const cancelDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const writeDraftImmediate = useCallback(
    (stateToSave: TState) => {
      cancelDebounceTimer();
      const storage = getSessionStorageSafe();
      if (!storage) {
        setStorageAvailable(false);
        setDraftStatus('idle');
        return;
      }

      if (isEmptyRef.current(stateToSave)) {
        try {
          storage.removeItem(storageKey);
          setStorageAvailable(true);
        } catch {
          setStorageAvailable(false);
        }
        lastSavedValueRef.current = stateToSave;
        setDraftStatus('idle');
        return;
      }

      try {
        const serialized = serializeRef.current(stateToSave, Date.now());
        storage.setItem(storageKey, serialized);
        lastSavedValueRef.current = stateToSave;
        setStorageAvailable(true);
        setDraftStatus('saved');
      } catch {
        setStorageAvailable(false);
        setDraftStatus('idle');
      }
    },
    [cancelDebounceTimer, storageKey],
  );

  // Restauração inicial segura ao montar
  useEffect(() => {
    const storage = getSessionStorageSafe();
    if (!storage) {
      setStorageAvailable(false);
      hasMountedRef.current = true;
      return;
    }

    try {
      const raw = storage.getItem(storageKey);
      const outcome = deserializeRef.current(raw, Date.now());

      if (outcome.status === 'valid' && outcome.data !== undefined) {
        restoredPendingRef.current = true;
        onRestoreRef.current(outcome.data);
        setDraftStatus('restored');
      } else if (outcome.status === 'expired' || outcome.status === 'corrupted') {
        try {
          storage.removeItem(storageKey);
        } catch {
          setStorageAvailable(false);
        }
        setDraftStatus('idle');
      }
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
      setDraftStatus('idle');
    }

    hasMountedRef.current = true;
  }, [storageKey]);

  // AutoSave com debounce durante digitação/alterações
  useEffect(() => {
    if (!hasMountedRef.current) return;

    if (prevValueRef.current === value) {
      return;
    }
    prevValueRef.current = value;

    if (restoredPendingRef.current) {
      restoredPendingRef.current = false;
      lastSavedValueRef.current = value;
      return;
    }

    if (isEmptyRef.current(value)) {
      writeDraftImmediate(value);
      return;
    }

    const storage = getSessionStorageSafe();
    if (!storage) {
      setStorageAvailable(false);
      setDraftStatus('idle');
      return;
    }

    setDraftStatus('saving');
    cancelDebounceTimer();
    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = null;
      writeDraftImmediate(latestValueRef.current);
    }, debounceMs);

    return () => {
      cancelDebounceTimer();
    };
  }, [value, debounceMs, cancelDebounceTimer, writeDraftImmediate]);

  // Salvamento imediato antes de navegação, mudança de visibilidade ou saída da página
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const flushLatest = () => {
      if (!hasMountedRef.current) return;
      if (lastSavedValueRef.current === latestValueRef.current) return;
      if (!isEmptyRef.current(latestValueRef.current)) {
        writeDraftImmediate(latestValueRef.current);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushLatest();
      }
    };

    const handleDocumentClickCapture = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('a[href^="#"]')) {
        flushLatest();
      }
    };

    window.addEventListener('pagehide', flushLatest);
    window.addEventListener('beforeunload', flushLatest);
    window.addEventListener('hashchange', flushLatest);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('click', handleDocumentClickCapture, { capture: true });

    return () => {
      window.removeEventListener('pagehide', flushLatest);
      window.removeEventListener('beforeunload', flushLatest);
      window.removeEventListener('hashchange', flushLatest);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', handleDocumentClickCapture, { capture: true });
      cancelDebounceTimer();
    };
  }, [cancelDebounceTimer, writeDraftImmediate]);

  const saveNow = useCallback(() => {
    if (!hasMountedRef.current) return;
    if (lastSavedValueRef.current === latestValueRef.current) return;
    writeDraftImmediate(latestValueRef.current);
  }, [writeDraftImmediate]);

  const clearDraft = useCallback(() => {
    cancelDebounceTimer();
    restoredPendingRef.current = false;
    lastSavedValueRef.current = latestValueRef.current;
    const storage = getSessionStorageSafe();
    if (storage) {
      try {
        storage.removeItem(storageKey);
        setStorageAvailable(true);
      } catch {
        setStorageAvailable(false);
      }
    }
    setDraftStatus('idle');
  }, [cancelDebounceTimer, storageKey]);

  return {
    draftStatus,
    storageAvailable,
    saveNow,
    clearDraft,
  };
}
