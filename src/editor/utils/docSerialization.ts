/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { SerializedDocument } from "@lexical/file";
import { deflate, inflate } from "pako";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function* generateReader<T = any>(
  reader: ReadableStreamDefaultReader<T>
) {
  let done = false;
  while (!done) {
    const res = await reader.read();
    const { value } = res;
    if (value !== undefined) {
      yield value;
    }
    done = res.done;
  }
}

async function readBytestoString(
  reader: ReadableStreamDefaultReader
): Promise<string> {
  const output = [];
  const chunkSize = 0x8000;
  for await (const value of generateReader(reader)) {
    for (let i = 0; i < value.length; i += chunkSize) {
      output.push(String.fromCharCode(...value.subarray(i, i + chunkSize)));
    }
  }
  return output.join("");
}

export async function docToHash(doc: SerializedDocument): Promise<string> {
  // Nén dữ liệu bằng pako
  const compressed = deflate(new TextEncoder().encode(JSON.stringify(doc)));
  const output = btoa(
    String.fromCharCode.apply(null, compressed as unknown as number[])
  )
    .replace(/\//g, "_")
    .replace(/\+/g, "-")
    .replace(/=+$/, "");
  return `#doc=${output}`;
}

export async function docFromHash(
  hash: string
): Promise<SerializedDocument | null> {
  const m = /^#doc=(.*)$/.exec(hash);
  if (!m) {
    return null;
  }

  // Giải mã dữ liệu từ Base64 và giải nén với pako
  const b64 = atob(m[1].replace(/_/g, "/").replace(/-/g, "+"));
  const array = new Uint8Array(b64.length);
  for (let i = 0; i < b64.length; i++) {
    array[i] = b64.charCodeAt(i);
  }

  // Giải nén dữ liệu bằng pako
  const decompressed = inflate(array, { to: "string" });
  return JSON.parse(decompressed);
}
