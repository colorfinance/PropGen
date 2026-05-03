export type Ok<T> = { ok: true; data: T };
export type Err<E = Error> = { ok: false; error: E };
export type Result<T, E = Error> = Ok<T> | Err<E>;

export function ok<T>(data: T): Ok<T> {
  return { ok: true, data };
}

export function err<E = Error>(error: E): Err<E> {
  return { ok: false, error };
}

export async function fromPromise<T>(
  promise: Promise<T>,
): Promise<Result<T, Error>> {
  try {
    const data = await promise;
    return ok(data);
  } catch (caught) {
    const error =
      caught instanceof Error ? caught : new Error(String(caught));
    return err(error);
  }
}

export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) return result.data;
  throw result.error instanceof Error
    ? result.error
    : new Error(String(result.error));
}
