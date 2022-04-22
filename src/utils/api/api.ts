//
// A super simple (not finished) wrapper for NXT API calls
//

import { BASEURL } from "./constants";

export async function API(
  url: string,
  method: "GET" | "POST",
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data?: any
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
): Promise<any> {
  let result;
  if (method === "GET") {
    result = await fetch(BASEURL + url);
  } else {
    result = await fetch(BASEURL + url, {
      method,
      body: JSON.stringify(data),
    });
  }

  const jsonResult = await result.json();
  return jsonResult;
}
