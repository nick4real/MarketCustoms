import { HttpError } from "./httpError";

export async function readResponse(
  response: Response,
  action: string,
): Promise<unknown> {
  if (!response.ok) {
    throw new HttpError(
      response.status,
      `${action} failed (${response.status})`,
    );
  }
  return await response.json();
}
