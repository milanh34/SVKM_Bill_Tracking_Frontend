/**
 * A raw bill (as the Home tab holds it) turned into the row the Bill Journey
 * report sends, keyed the same way - a mirror of the projection in the
 * backend's getBillJourney. Lets the Bill Journey checklist print every
 * step's date and name from a Home-tab bill, using the same steps as
 * Print Bill Journey on the report (1.10, item 17).
 */
const pad = (n) => String(n).padStart(2, "0");

const fmt = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
};

const dateAndNo = (date, no) => (date ? `${fmt(date)} / ${no || ""}` : "");

export const billJourneyRow = (bill = {}) => ({
  siteApprovalDate: fmt(bill.siteOfficeDispatch?.dateGiven), // 58
  billReceivedAtSite: fmt(bill.taxInvRecdAtSite), // 24
  billReceivedAtSiteName: bill.taxInvRecdBy || "", // 25
  billSendForQualityCertification: fmt(bill.qualityEngineer?.dateGiven), // 33
  billSendForQualityCertificationName: bill.qualityEngineer?.name || "", // 34
  billSendToQS: fmt(bill.qsInspection?.dateGiven || bill.qsCOP?.dateGiven), // 35 / 40
  billSendToQSName: bill.qsInspection?.dateGiven
    ? bill.qsInspection?.name || "" // 36
    : bill.qsCOP?.name || "", // 41
  certifiedByQS: fmt(bill.copDetails?.date), // 42
  certifiedByQSAmount: bill.copDetails?.amount ?? "", // 43
  certifiedByArch: fmt(bill.architect?.dateGiven), // 53
  certifiedByArchName: bill.architect?.name || "", // 54
  billSendToSiteEngineer: fmt(bill.siteEngineer?.dateGiven || bill.siteIncharge?.dateGiven), // 51 / 55
  billSendToSiteEngineerName: bill.siteEngineer?.dateGiven
    ? bill.siteEngineer?.name || "" // 52
    : bill.siteIncharge?.name || "", // 56
  migoDateNo: dateAndNo(bill.migoDetails?.date, bill.migoDetails?.no), // 47 / 46
  migoDate: fmt(bill.migoDetails?.date),
  migoDoneBy: bill.migoDetails?.doneBy || "", // 49
  migoAmount: bill.migoDetails?.amount ?? "", // 48
  billSendToPIMOMumbai: fmt(bill.pimoMumbai?.dateGiven), // 61
  billReceivedAtPIMOMumbai: fmt(bill.pimoMumbai?.dateReceived), // 62
  billReceivedAtPIMOMumbaiName: bill.pimoMumbai?.receivedBy || "", // 63
  billSendToQSCertification: fmt(bill.qsMumbai?.dateGiven), // 64
  billSendToQSCertificationName: bill.qsMumbai?.name || "", // 65
  receivedFromQSWithCOP: fmt(bill.pimoMumbai?.dateReturnedFromQs), // 66
  receivedFromQSWithCOPName: bill.pimoMumbai?.nameReturnedFromQs || "", // 67
  receivedFromQSWithCOPAmount: bill.copDetails?.amount ?? "", // 43
  givenToITDept: fmt(bill.itDept?.dateGiven), // 68
  givenToITDeptName: bill.itDept?.name || "", // 69
  receivedBackFromITDept: fmt(bill.pimoMumbai?.dateReceivedFromIT), // 75
  receivedBackFromITDeptName: bill.pimoMumbai?.nameReceivedFromIT || "", // 75A
  sesDateNo: dateAndNo(bill.sesDetails?.date, bill.sesDetails?.no), // 74 / 72
  sesDate: fmt(bill.sesDetails?.date),
  sesDoneBy: bill.sesDetails?.doneBy || "", // 74A
  sesAmount: bill.sesDetails?.amount ?? "", // 73
  certifiedByProjectDirector: fmt(bill.pimoMumbai?.dateReturnedFromDirector), // 78
  submittedToAccountsDepartment: fmt(bill.accountsDept?.dateGiven), // 80
  submittedToAccountsDepartmentName: bill.accountsDept?.givenBy || "", // 81
  receivedInAccountsDepartment: fmt(bill.accountsDept?.dateReceived), // 82
  receivedInAccountsDepartmentName: bill.accountsDept?.receivedBy || "", // 82A
  paymentDate: fmt(bill.accountsDept?.paymentDate), // 89
  paymentAmt: bill.accountsDept?.paymentAmt ?? "", // 91
});
