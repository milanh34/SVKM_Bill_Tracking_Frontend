/**
 * Reject Bill on PIMO and Accounts Send/Unreceive (27.10, tracker N-01).
 *
 *   PIMO      Dt recd-PIMO (62) filled AND Dt given-Accts (80) blank
 *             -> Remarks PIMO Mumbai (79)
 *   Accounts  Dt recd-Accts (82) filled AND Dt of Payment (89) blank
 *             -> Remarks Accts (92)
 *
 * Both stamp Dt-Rejection (97) and Name Rejected by (98). The server
 * (utils/reject-bill.js) re-checks the same rule for every bill; this copy
 * only decides whether the option is offered.
 */

export const REJECT_BILL_OPTION = { value: "reject_bill", label: "Reject Bill" };

const isPimo = (role) => role === "site_pimo" || role === "pimo_mumbai";

/** The pop-up's text-box label, which replaces "Send To" (27.10). */
export const rejectRemarksLabel = (role) =>
  isPimo(role) ? "Remarks PIMO Mumbai" : "Remarks Accounts";

/**
 * May `role` reject `bill`? Also requires col 97 blank (not already
 * rejected) and Status at Site Accept, as the server does.
 */
export const canRejectBill = (bill, role) => {
  if (!bill || bill.rejection?.date || bill.siteStatus !== "accept") return false;
  if (isPimo(role)) {
    return Boolean(bill.pimoMumbai?.dateReceived) && !bill.accountsDept?.dateGiven; // 62, 80
  }
  if (role === "accounts") {
    return Boolean(bill.accountsDept?.dateReceived) && !bill.accountsDept?.paymentDate; // 82, 89
  }
  return false;
};

/**
 * May `role` undo (Unsend) the rejection of `bill`? Col 97 filled, and the
 * rejection was this team's: PIMO rejects before col 80, so col 82 is blank;
 * Accounts after col 82. The server applies the same split.
 */
export const canUndoRejectBill = (bill, role) => {
  if (!bill?.rejection?.date) return false;
  if (isPimo(role)) return !bill.accountsDept?.dateReceived;
  if (role === "accounts") return Boolean(bill.accountsDept?.dateReceived);
  return false;
};

/**
 * `roles` plus Reject Bill when EVERY selected bill qualifies (27.10): the
 * option is offered only if it applies to the whole selection.
 */
export const withRejectBillOption = (roles, selectedBills, role) => {
  if (!isPimo(role) && role !== "accounts") return roles;
  const all = selectedBills.length > 0 && selectedBills.every((b) => canRejectBill(b, role));
  return all ? [...roles, REJECT_BILL_OPTION] : roles;
};
