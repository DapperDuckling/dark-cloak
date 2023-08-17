import {EventEmitter} from 'node:events';
import type {Logger} from "pino";

import type {Listener} from "../types.js";

export enum BaseClusterEvents {
    ERROR = "error",
    BASE = "BASE",
    PRE_CONNECTION = "PRE_CONNECTION",
    CONNECTED = "CONNECTED",
}

type AllEvents<T extends string | void> = T extends void ? BaseClusterEvents : BaseClusterEvents | T;

export interface ClusterConfig {
    pinoLogger?: Logger
}

export interface LockOptions {
    key: string,
    ttl: number, // TTL in seconds
}

export abstract class AbstractClusterProvider<CustomEvents extends string | void = void> {

    protected clusterConfig: ClusterConfig;
    private eventEmitter = new EventEmitter();

    protected constructor(clusterConfig: ClusterConfig) {
        // Update pino logger reference
        if (clusterConfig.pinoLogger) {
            clusterConfig.pinoLogger = clusterConfig.pinoLogger.child({"Source": "ClusterProvider"})
        }

        this.clusterConfig = clusterConfig;

    }

    abstract connectOrThrow(): Promise<true>;
    abstract isConnected(isSubscriber: boolean): boolean;
    abstract disconnect(): Promise<boolean>;

    public addListener(event: AllEvents<CustomEvents>, listener: Listener) {
        this.clusterConfig.pinoLogger?.debug(`Adding a listener for '${event}' event`);
        this.eventEmitter.addListener(event, listener);
    }

    public removeListener(event: AllEvents<CustomEvents>, listener: Listener) {
        this.clusterConfig.pinoLogger?.debug(`Removing a listener for '${event}' event`);
        this.eventEmitter.removeListener(event, listener);
    }

    public emitEvent(event: AllEvents<CustomEvents>, ...args: any[]) {
        this.clusterConfig.pinoLogger?.debug(`Emitting an event: '${event}'`);
        this.eventEmitter.emit(event, ...args);
    }

    public abstract subscribe(channel: string, listener: Listener): Promise<boolean>;
    public abstract unsubscribe(channel: string, listener: Listener): Promise<boolean>;
    public abstract publish(channel: string, message: string | Buffer): Promise<boolean>;
    public abstract get(key: string): Promise<string | null>;
    public abstract store(key: string, value: string | number | Buffer, ttl: number | null, lockKey?: string): Promise<boolean>;
    public abstract remove(key: string): Promise<boolean>;
    public abstract lock(lockOptions: LockOptions): Promise<boolean>;
    public abstract unlock(lockOptions: LockOptions): Promise<boolean>;
}
