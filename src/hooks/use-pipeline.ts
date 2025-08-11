import { Pipeline, PretrainedOptions, Tensor } from "@xenova/transformers";
import { useEffect, useState } from "react";
import {
  InitEventData,
  OutgoingEventData,
  RunEventData,
} from "@/lib/workers/pipeline";

export type PipeParameters = Parameters<Pipeline["_call"]>;
export type PipeReturnType = Awaited<ReturnType<Pipeline["_call"]>>;
export type PipeFunction = (...args: PipeParameters) => Promise<PipeReturnType>;

export function usePipeline(
  task: string,
  model?: string,
  options?: PretrainedOptions
) {
  const [worker, setWorker] = useState<Worker>();
  const [pipe, setPipe] = useState<PipeFunction>();

  useEffect(() => {
    const { progress_callback, ...transferableOptions } = options ?? {};

    const worker = new Worker(
      new URL("../lib/workers/pipeline.ts", import.meta.url),
      {
        type: "module",
      }
    );

    const onMessageReceived = (e: MessageEvent<OutgoingEventData>) => {
      const { type } = e.data;

      switch (type) {
        case "progress": {
          const { data } = e.data;
          progress_callback?.(data);
          break;
        }
        case "ready": {
          setWorker(worker);
          break;
        }
      }
    };

    worker.addEventListener("message", onMessageReceived);
    worker.postMessage({
      type: "init",
      args: [task, model, transferableOptions],
    } satisfies InitEventData);

    return () => {
      worker.removeEventListener("message", onMessageReceived);
      worker.terminate();

      setWorker(undefined);
    };
  }, [task, model, options]);

  useEffect(() => {
    if (!worker) {
      return;
    }

    let currentId = 0;

    const callbacks = new Map<number, (data: PipeReturnType) => void>();

    const onMessageReceived = (e: MessageEvent<OutgoingEventData>) => {
      switch (e.data.type) {
        case "result":
          const { id, data: serializedData } = e.data;

          let output: PipeReturnType;

          const isTensorData =
            serializedData &&
            typeof serializedData === "object" &&
            "type" in serializedData &&
            "data" in serializedData &&
            "dims" in serializedData;

          if (isTensorData) {
            const { type, data, dims } = serializedData;
            output = new Tensor(type, data, dims) as PipeReturnType;
          } else {
            output = serializedData;
          }

          const callback = callbacks.get(id);

          if (!callback) {
            throw new Error(`Missing callback for pipe execution id: ${id}`);
          }

          callback(output);
          break;
      }
    };

    worker.addEventListener("message", onMessageReceived);

    const pipe: PipeFunction = (...args) => {
      if (!worker) {
        throw new Error("Worker unavailable");
      }

      const id = currentId++;

      return new Promise<PipeReturnType>((resolve) => {
        callbacks.set(id, resolve);
        worker.postMessage({ type: "run", id, args } satisfies RunEventData);
      });
    };

    setPipe(() => pipe);

    return () => {
      worker?.removeEventListener("message", onMessageReceived);
      setPipe(undefined);
    };
  }, [worker]);

  return pipe;
}
