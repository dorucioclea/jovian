//
// The best place to store parameters which aren't yet exposed to the user but which we may want to expose
//

// Used to calculate the origination time of new transactions
export const JUPGenesisTimestamp = 1508627969; // can be found in getConstants() API call as "epochBeginning"

// TODO: implement as advanced features?
export const standardFee = "5000";
export const standardDeadline = 1440;
export const userLocale = { localeStr: "en-US", options: { timeZone: "America/New_York" } }; // CST for testing
export const unitPrecision = 8; // 8 digits of unit precision
