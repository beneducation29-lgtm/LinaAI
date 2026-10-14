  const [listeningProgress, setListeningProgress] = useState<ListeningProgress>(() => readListeningProgress(null));
  const listeningProgressOwnerRef = React.useRef('guest');
  const skipListeningProgressPersistRef = React.useRef(false);
  const [syncState, setSyncState] = useState<SyncState>(() => ({ status: 'offline', lastSyncedAt: null, pendingCount: 0, error: null, userId: null }));
  const syncReadyRef = React.useRef(false);
  const [syncReady, setSyncReady] = useState(false);
  const applyingRemoteRef = React.useRef(false);