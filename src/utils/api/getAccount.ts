//
// API call helper for getAccount, not meant to be called directly (meant to be used inside the APIProvider)
//

import { API, IAPICall } from "./api";
import { BASEURL } from "./constants";

/*
 * http://localhost:7876/nxt?
 *   requestType=getAccount&
 *   account=JUP-9J5L-9BX3-7HCX-AP3MK
 */

interface IGetAccountParams extends IAPICall {
  params: {
    account: string;
  };
}

async function getAccount(account: string) {
  let result;

  const options: IGetAccountParams = {
    url: BASEURL,
    method: "GET",
    requestType: "getAccount",
    params: {
      account: account,
    },
  };

  try {
    result = await API(options);
  } catch (e) {
    console.error("error getAccount():", e);
    return false;
  }
  return result;
}

export default getAccount;
