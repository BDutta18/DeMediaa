import { EventEmitter } from "events";

export type PlatformEventType =
  | "tx_status"
  | "nft_minted"
  | "nft_sale_toggled"
  | "nft_purchased"
  | "profile_updated"
  | "copyright_detected"
  | "license_created"
  | "license_purchased";

export interface PlatformEvent<T = unknown> {
  type: PlatformEventType;
  payload: T;
  timestamp: string;
}

const emitter = new EventEmitter();

export const emitPlatformEvent = <T>(
  type: PlatformEventType,
  payload: T
): void => {
  const event: PlatformEvent<T> = {
    type,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitter.emit("platform_event", event);
};

export const onPlatformEvent = (
  listener: (event: PlatformEvent) => void
): (() => void) => {
  emitter.on("platform_event", listener);
  return () => emitter.off("platform_event", listener);
};
