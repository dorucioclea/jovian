//
// Basic converter to handle the NQT (JQT?) balances returned from the API
//
// Docs: https://nxtdocs.jelurida.com/API#Quantity_Units_NXT.2C_NQT_and_QNT
//

import { BigNumber } from "bignumber.js";

export function NXTtoNQT(quantity: BigNumber): BigNumber {
  return new BigNumber(quantity.pow(8));
}
