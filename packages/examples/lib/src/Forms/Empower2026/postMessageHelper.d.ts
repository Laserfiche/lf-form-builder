export type MessageMap = Record<string, unknown>;
export type MessageType<Messages extends MessageMap> = Extract<keyof Messages, string>;
export type PostMessageData<Messages extends MessageMap, Type extends MessageType<Messages> = MessageType<Messages>> = {
    [Key in Type]: undefined extends Messages[Key] ? {
        type: Key;
        payload?: Messages[Key];
    } : {
        type: Key;
        payload: Messages[Key];
    };
}[Type];
export type PostMessageEnvelope<Messages extends MessageMap, Type extends MessageType<Messages> = MessageType<Messages>> = PostMessageData<Messages, Type> & {
    channelId?: string;
};
export type MessageValidator<Payload> = (value: unknown) => value is Payload;
export type PostMessageHandler<Messages extends MessageMap, Type extends MessageType<Messages>> = (payload: Messages[Type], event: MessageEvent<PostMessageEnvelope<Messages, Type>>) => void;
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
export declare class PostMessageHelper<Messages extends MessageMap> {
    private readonly targetOrigin;
    private readonly listeners;
    private discoveredSourceWindow;
    private isPeerDiscovered;
    private resolvePeerDiscovered;
    private readonly sourceWindow;
    private readonly channelId?;
    private readonly getExpectedSourceWindow;
    private readonly getTargetWindows;
    private readonly peerDiscoveredPromise;
    private readonly peerDiscoveryEnabled;
    private readonly onInvalidMessage;
    private readonly validators;
    /**
     * @param targetOrigin The expected origin of the target window (e.g. 'https://example.com'). Use '*' with caution.
     */
    constructor(targetOrigin: string, options?: PostMessageHelperOptions<Messages>);
    private readonly handleMessage;
    private isTrustedOrigin;
    private getSiblingFrames;
    private captureOrValidatePeerWindow;
    private handlePeerDiscoveryMessage;
    private markPeerDiscovered;
    private sendPeerDiscoveryMessage;
    private getSendTargets;
    whenPeerDiscovered(): Promise<void>;
    /**
     * Sends a typed message to each configured target window.
     * Returns the number of target windows that received the message.
     */
    send<Type extends MessageType<Messages>>(message: PostMessageData<Messages, Type>): number;
    /**
     * Subscribe to a specific message type.
     * Returns an unsubscribe function for convenience.
     */
    subscribe<Type extends MessageType<Messages>>(type: Type, handler: PostMessageHandler<Messages, Type>): () => void;
    /**
     * Unsubscribe from a specific message type.
     */
    unsubscribe<Type extends MessageType<Messages>>(type: Type, handler: PostMessageHandler<Messages, Type>): void;
    /**
     * Clean up the global event listener.
     */
    destroy(): void;
}
