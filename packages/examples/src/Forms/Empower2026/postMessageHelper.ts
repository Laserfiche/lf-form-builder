export type MessageMap = Record<string, unknown>;

export type MessageType<Messages extends MessageMap> = Extract<keyof Messages, string>;

export type PostMessageData<
  Messages extends MessageMap,
  Type extends MessageType<Messages> = MessageType<Messages>,
> = {
  [Key in Type]: undefined extends Messages[Key]
    ? { type: Key; payload?: Messages[Key] }
    : { type: Key; payload: Messages[Key] };
}[Type];

export type PostMessageEnvelope<
  Messages extends MessageMap,
  Type extends MessageType<Messages> = MessageType<Messages>,
> = PostMessageData<Messages, Type> & {
  channelId?: string;
};

export type MessageValidator<Payload> = (value: unknown) => value is Payload;

export type PostMessageHandler<
  Messages extends MessageMap,
  Type extends MessageType<Messages>,
> = (
  payload: Messages[Type],
  event: MessageEvent<PostMessageEnvelope<Messages, Type>>,
) => void;

export interface PostMessageHelperOptions<Messages extends MessageMap> {
  channelId?: string;
  getExpectedSourceWindow?: () => Window | null | undefined;
  getTargetWindows?: () => Iterable<Window>;
  onInvalidMessage?: (event: MessageEvent<unknown>, reason: string) => void;
  peerDiscovery?: boolean;
  sourceWindow?: Window;
  validators?: Partial<{
    [Type in MessageType<Messages>]: MessageValidator<Messages[Type]>;
  }>;
}

type AnyMessageHandler<Messages extends MessageMap> = (
  payload: Messages[MessageType<Messages>],
  event: MessageEvent<PostMessageEnvelope<Messages>>,
) => void;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isWindowMessageSource = (value: MessageEventSource | null): value is Window =>
  isRecord(value) && 'closed' in value && typeof value.postMessage === 'function';

const peerDiscoveryKey = '__postMessageHelper';

type PeerDiscoveryPhase = 'hello' | 'hello-ack';

type PeerDiscoveryData = {
  channelId?: string;
  [peerDiscoveryKey]: {
    kind: 'peer-discovery';
    phase: PeerDiscoveryPhase;
  };
};

const isPeerDiscoveryData = (value: Record<string, unknown>): value is PeerDiscoveryData => {
  const meta = value[peerDiscoveryKey];

  return (
    isRecord(meta) &&
    meta.kind === 'peer-discovery' &&
    (meta.phase === 'hello' || meta.phase === 'hello-ack')
  );
};

/**
 * Helper class for typed cross-iframe communication using postMessage.
 *
 * Define message types as a map from message name to payload type:
 *
 * type Messages = {
 *   GREETING: { name: string };
 *   DATA_UPDATE: { value: number };
 *   CLOSE_IFRAME: undefined;
 * };
 */
export class PostMessageHelper<Messages extends MessageMap> {
  private readonly listeners = new Map<
    MessageType<Messages>,
    Set<AnyMessageHandler<Messages>>
  >();

  private discoveredSourceWindow: Window | null = null;

  private isPeerDiscovered = false;

  private resolvePeerDiscovered: () => void = () => {};

  private readonly sourceWindow: Window;

  private readonly channelId?: string;

  private readonly getExpectedSourceWindow: () => Window | null | undefined;

  private readonly getTargetWindows: () => Iterable<Window>;

  private readonly peerDiscoveredPromise: Promise<void>;

  private readonly peerDiscoveryEnabled: boolean;

  private readonly onInvalidMessage: (event: MessageEvent<unknown>, reason: string) => void;

  private readonly validators: Partial<{
    [Type in MessageType<Messages>]: MessageValidator<Messages[Type]>;
  }>;

  /**
   * @param targetOrigin The expected origin of the target window (e.g. 'https://example.com'). Use '*' with caution.
   */
  constructor(
    private readonly targetOrigin: string,
    options: PostMessageHelperOptions<Messages> = {},
  ) {
    this.sourceWindow = options.sourceWindow ?? window;
    this.channelId = options.channelId;
    this.getExpectedSourceWindow = options.getExpectedSourceWindow ?? (() => undefined);
    this.getTargetWindows =
      options.getTargetWindows ?? (() => this.getSiblingFrames(this.sourceWindow));
    this.peerDiscoveryEnabled = options.peerDiscovery ?? false;
    this.onInvalidMessage =
      options.onInvalidMessage ??
      ((event, reason) => {
        console.warn(`Ignored postMessage from ${event.origin}: ${reason}`);
      });
    this.validators = options.validators ?? {};
    this.peerDiscoveredPromise = new Promise<void>((resolve) => {
      this.resolvePeerDiscovered = resolve;
    });

    this.sourceWindow.addEventListener('message', this.handleMessage);

    if (!this.peerDiscoveryEnabled) {
      this.markPeerDiscovered();
      return;
    }

    this.sendPeerDiscoveryMessage('hello');
  }

  private readonly handleMessage = (event: MessageEvent<unknown>): void => {
    if (!this.isTrustedOrigin(event.origin)) {
      this.onInvalidMessage(
        event,
        `expected origin ${this.targetOrigin} but received ${event.origin}`,
      );
      return;
    }

    if (!isRecord(event.data)) {
      this.onInvalidMessage(event, 'message payload was not an object');
      return;
    }

    if (this.channelId && event.data.channelId !== this.channelId) {
      this.onInvalidMessage(event, 'message channel did not match');
      return;
    }

    if (!this.captureOrValidatePeerWindow(event)) {
      return;
    }

    if (isPeerDiscoveryData(event.data)) {
      this.handlePeerDiscoveryMessage(event as MessageEvent<PeerDiscoveryData>);
      return;
    }

    if (typeof event.data.type !== 'string') {
      this.onInvalidMessage(event, 'message is missing a string type');
      return;
    }

    const type = event.data.type as MessageType<Messages>;
    const payload = event.data.payload as Messages[typeof type];
    const validator = this.validators[type];

    if (validator && !validator(payload)) {
      this.onInvalidMessage(event, `payload validation failed for ${type}`);
      return;
    }

    const handlers = this.listeners.get(type);
    if (!handlers) {
      console.warn('No trusted handlers for action', event.data)
      return;
    }

    const typedEvent = event as MessageEvent<
      PostMessageEnvelope<Messages, typeof type>
    >;
    handlers.forEach((handler) => {
      handler(
        payload,
        typedEvent,
      );
    });
  };

  private isTrustedOrigin(origin: string): boolean {
    return this.targetOrigin === '*' || origin === this.targetOrigin;
  }

  private getSiblingFrames(currentWindow: Window): Window[] {
    const targetWindows: Window[] = [];

    for (let index = 0; index < currentWindow.parent.frames.length; index++) {
      const frame = currentWindow.parent.frames[index];
      if (frame !== currentWindow) {
        targetWindows.push(frame);
      }
    }

    return targetWindows;
  }

  private captureOrValidatePeerWindow(event: MessageEvent<unknown>): boolean {
    const expectedSourceWindow =
      this.getExpectedSourceWindow() ?? this.discoveredSourceWindow;

    if (expectedSourceWindow && event.source !== expectedSourceWindow) {
      this.onInvalidMessage(event, 'message source did not match expected window');
      return false;
    }

    if (!expectedSourceWindow && isWindowMessageSource(event.source)) {
      this.discoveredSourceWindow = event.source;
    }

    return true;
  }

  private handlePeerDiscoveryMessage(event: MessageEvent<PeerDiscoveryData>): void {
    const phase = event.data[peerDiscoveryKey].phase;

    this.markPeerDiscovered();

    if (phase === 'hello') {
      this.sendPeerDiscoveryMessage('hello-ack');
    }
  }

  private markPeerDiscovered(): void {
    if (this.isPeerDiscovered) {
      return;
    }

    this.isPeerDiscovered = true;
    this.resolvePeerDiscovered();
  }

  private sendPeerDiscoveryMessage(phase: PeerDiscoveryPhase): number {
    let sentCount = 0;
    const message: PeerDiscoveryData = {
      [peerDiscoveryKey]: {
        kind: 'peer-discovery',
        phase,
      },
      ...(this.channelId ? { channelId: this.channelId } : {}),
    };

    for (const targetWindow of this.getSendTargets()) {
      targetWindow.postMessage(message, this.targetOrigin);
      sentCount += 1;
    }

    return sentCount;
  }

  private getSendTargets(): Iterable<Window> {
    const expectedSourceWindow =
      this.getExpectedSourceWindow() ?? this.discoveredSourceWindow;

    if (expectedSourceWindow) {
      return [expectedSourceWindow];
    }

    return this.getTargetWindows();
  }

  public whenPeerDiscovered(): Promise<void> {
    return this.peerDiscoveredPromise;
  }

  /**
   * Sends a typed message to each configured target window.
   * Returns the number of target windows that received the message.
   */
  public send<Type extends MessageType<Messages>>(
    message: PostMessageData<Messages, Type>,
  ): number {
    let sentCount = 0;
    const envelope = this.channelId
      ? { ...message, channelId: this.channelId }
      : message;

    for (const targetWindow of this.getSendTargets()) {
      targetWindow.postMessage(envelope, this.targetOrigin);
      sentCount += 1;
    }

    return sentCount;
  }

  /**
   * Subscribe to a specific message type.
   * Returns an unsubscribe function for convenience.
   */
  public subscribe<Type extends MessageType<Messages>>(
    type: Type,
    handler: PostMessageHandler<Messages, Type>,
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)?.add(handler as unknown as AnyMessageHandler<Messages>);

    return () => {
      this.unsubscribe(type, handler);
    };
  }

  /**
   * Unsubscribe from a specific message type.
   */
  public unsubscribe<Type extends MessageType<Messages>>(
    type: Type,
    handler: PostMessageHandler<Messages, Type>,
  ): void {
    const handlers = this.listeners.get(type);
    if (!handlers) {
      return;
    }

    handlers.delete(handler as unknown as AnyMessageHandler<Messages>);

    if (handlers.size === 0) {
      this.listeners.delete(type);
    }
  }

  /**
   * Clean up the global event listener.
   */
  public destroy(): void {
    this.sourceWindow.removeEventListener('message', this.handleMessage);
    this.listeners.clear();
  }
}
