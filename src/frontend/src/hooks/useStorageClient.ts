import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useRef } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

export function useStorageClient() {
  const { identity } = useInternetIdentity();
  const clientRef = useRef<StorageClient | null>(null);

  const getClient = useCallback(async (): Promise<StorageClient> => {
    const config = await loadConfig();
    const agent = new HttpAgent({
      host: config.backend_host,
      identity: identity ?? undefined,
    });
    clientRef.current = new StorageClient(
      config.bucket_name,
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      agent,
    );
    return clientRef.current;
  }, [identity]);

  const uploadImages = useCallback(
    async (
      files: File[],
      onTotalProgress?: (pct: number) => void,
    ): Promise<string[]> => {
      const client = await getClient();
      const hashes: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const bytes = new Uint8Array(await files[i].arrayBuffer());
        const { hash } = await client.putFile(bytes, (pct) => {
          if (onTotalProgress) {
            onTotalProgress(Math.round(((i + pct / 100) / files.length) * 100));
          }
        });
        hashes.push(hash);
      }
      return hashes;
    },
    [getClient],
  );

  const getImageURL = useCallback(
    async (hash: string): Promise<string> => {
      const client = await getClient();
      return client.getDirectURL(hash);
    },
    [getClient],
  );

  return { uploadImages, getImageURL };
}
