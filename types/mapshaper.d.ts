/* eslint no-unused-vars: ["error", {"args": "none"}] */
type ErrCallback = (error: Error) => void;
type Callback = (error: Error, data: {[filename: string]: string}) => void;

type MapShaperInput = { [fileName: string]: string }

declare module 'mapshaper' {
  export function runCommands(
    commands: string,
    input: MapShaperInput,
    callback?: ErrCallback,
  ): void;

  export function runCommands(
    commands: string,
    callback: ErrCallback,
  ): void;

  export function runCommands(
    commands: string,
  ): Promise<void>;

  export function applyCommands(
    commands: string,
    input: MapShaperInput,
    callback?: Callback,
  ): void;

  export function applyCommands(
    commands: string,
    callback: Callback,
  ): void;

  export function applyCommands(
    commands: string,
  ): Promise<{[filename: string]: string}>;
}
