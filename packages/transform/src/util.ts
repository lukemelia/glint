import type ts from 'typescript';
import { SourceFile } from './template/transformed-module';

export type TSLib = typeof ts;

export function unreachable(value: never, message = 'unreachable code'): never {
  throw new Error(`[@glint/transform] Internal error: ${message}`);
}

export function assert(test: unknown, message = 'Internal error'): asserts test {
  if (test == null || test === false) {
    throw new Error(message);
  }
}

export function createSyntheticSourceFile(ts: TSLib, source: SourceFile): ts.SourceFile {
  return Object.assign(ts.createSourceFile(source.filename, '', ts.ScriptTarget.Latest), {
    text: source.contents,
    end: source.contents.length,
  });
}
