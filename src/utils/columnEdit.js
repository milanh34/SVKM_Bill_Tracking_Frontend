export const getColumnsForRole = (role) => {
  const allColumns = [
    { field: "srNo", headerName: "Sr no" }, // column no 1
    // { field: "srNoOld", headerName: "Sr no Old" }, // column no 2
    { field: "natureOfWork", headerName: "Nature of Work" }, // column no 3
    { field: "region", headerName: "Region" }, // column no 4
    { field: "projectDescription", headerName: "Project Description" }, // column no 5
    { field: "vendorNo", headerName: "Vendor no" }, // column no 6
    { field: "vendorName", headerName: "Vendor Name" }, // column no 7
    { field: "taxInvNo", headerName: "Tax Inv no" }, // column no 20
    { field: "taxInvDate", headerName: "Tax Inv Dt" }, // column no 21
    { field: "taxInvAmt", headerName: "Tax Inv Amt" }, // column no 23
    { field: "poCreated", headerName: "If PO created??" }, // column no 11
    { field: "poNo", headerName: "PO no" }, // column no 12
    { field: "poDate", headerName: "PO Dt" }, // column no 13
    { field: "poAmt", headerName: "PO Amt" }, // column no 14
    { field: "proformaInvNo", headerName: "Proforma Inv No" }, // column no 15
    { field: "proformaInvDate", headerName: "Proforma Inv Dt" }, // column no 16
    { field: "proformaInvAmt", headerName: "Proforma Inv Amt" }, // column no 17
    { field: "proformaInvRecdAtSite", headerName: "Proforma Inv Recd at site" }, // column no 18
    { field: "proformaInvRecdBy", headerName: "Proforma Inv Recd by" }, // column no 19
    { field: "gstNumber", headerName: "GST No" }, // column no 8
    { field: "compliance206AB", headerName: "206AB Compliance" }, // column no 9
    { field: "panStatus", headerName: "PAN Status" }, // column no 10
    { field: "currency", headerName: "Currency" }, // column no 22
    { field: "taxInvRecdAtSite", headerName: "Dt Recd at site" }, // column no 24
    { field: "taxInvRecdBy", headerName: "Tax Inv Recd by" }, // column no 25
    { field: "department", headerName: "Additional Info" }, // column no 26
    { field: "remarksBySiteTeam", headerName: "Remarks related to Inv" }, // column no 27
    { field: "attachments", headerName: "Attachment" }, // column no 28
    { field: "advanceDate", headerName: "Advance Dt" }, // column no 29
    { field: "advanceAmt", headerName: "Advance Amt" }, // column no 30
    { field: "advancePercentage", headerName: "Advance Percentage" }, // column no 31
    { field: "advRequestEnteredBy", headerName: "Adv request entered by" }, // column no 32
    { field: "qualityEngineer.dateGiven", headerName: "Dt given-Quality Engineer" }, // column no 33
    { field: "qualityEngineer.name", headerName: "Name-Quality Engineer" }, // column no 34
    { field: "qsInspection.dateGiven", headerName: "Dt given-QS for measure" }, // column no 35
    { field: "qsInspection.name", headerName: "Name-QS Measure" }, // column no 36
    { field: "qsMeasurementCheck.dateGiven", headerName: "Dt Checked by QS with Measure" }, // column no 37
    { field: "vendorFinalInv.dateGiven", headerName: "Dt ret-QS aft measure" }, // column no 38
    { field: "vendorFinalInv.name", headerName: "Name ret-QS aft measure" }, // column no 39
    { field: "qsCOP.dateGiven", headerName: "Dt Given-QS for Prov COP" }, // column no 40
    { field: "qsCOP.name", headerName: "Name-QS Prov COP" }, // column no 41
    { field: "copDetails.date", headerName: "COP Dt" }, // column no 42
    { field: "copDetails.amount", headerName: "COP Amt" }, // column no 43
    { field: "remarksByQSTeam", headerName: "Remarks by QS Team" }, // column no 44
    { field: "copDetails.dateReturned", headerName: "Dt ret-QS aft Prov COP" }, // column no 44A
    { field: "migoDetails.dateGiven", headerName: "Dt given-MIGO" }, // column no 45
    { field: "migoDetails.no", headerName: "MIGO no" }, // column no 46
    { field: "migoDetails.date", headerName: "MIGO Dt" }, // column no 47
    { field: "migoDetails.amount", headerName: "MIGO Amt" }, // column no 48
    { field: "migoDetails.doneBy", headerName: "MIGO done by" }, // column no 49
    { field: "invReturnedToSite", headerName: "Dt-ret aft MIGO to Site" }, // column no 50
    { field: "siteEngineer.dateGiven", headerName: "Dt given-Site Engineer" }, // column no 51
    { field: "siteEngineer.name", headerName: "Name-Site Engineer" }, // column no 52
    { field: "architect.dateGiven", headerName: "Dt given-Architect" }, // column no 53
    { field: "architect.name", headerName: "Name-Architect" }, // column no 54
    { field: "siteIncharge.dateGiven", headerName: "Dt given-Site Incharge" }, // column no 55
    { field: "siteIncharge.name", headerName: "Name-Site Incharge" }, // column no 56
    { field: "remarks", headerName: "Remarks at site" }, // column no 57
    { field: "siteOfficeDispatch.dateGiven", headerName : "Dt given-Site Office for dispatch" }, // column no 58
    { field: "siteOfficeDispatch.name", headerName: "Name-Site Office" }, // column no 59
    { field: "siteStatus", headerName: "Status at Site" }, // column no 60
    { field: "pimoMumbai.dateGiven", headerName: "Dt dispatched-PIMO" }, // column no 61
    { field: "pimoMumbai.dateReceived", headerName: "Dt recd-PIMO from Site" }, // column no 62
    { field: "pimoMumbai.receivedBy", headerName: "Name recd-PIMO from Site" }, // column no 63
    { field: "qsMumbai.dateGiven", headerName: "Dt given-QS Mumbai for COP" }, // column no 64
    { field: "qsMumbai.name", headerName: "Name-QS Mumbai for COP" }, // column no 65
    { field: "pimoMumbai.dateReturnedFromQs", headerName: "Dt ret-PIMO by QS Mumbai" }, // column no 66
    { field: "pimoMumbai.namePIMO2", headerName: "Name ret-PIMO by QS Mumbai" }, // column no 67
    // { field: "pimoMumbai.namePIMO", headerName: "Name given by Site to PIMO" },
    { field: "itDept.dateGiven", headerName: "Date given-IT Dept for SES" }, // column no 68
    { field: "itDept.name", headerName: "Name-IT Dept for SES" }, // column no 69
    { field: "pimoMumbai.dateGivenPIMO2", headerName: "Dt given-PIMO for SES" }, // column no 70
    { field: "sesDetails.name", headerName: "Name-PIMO for SES" }, // column no 71
    { field: "sesDetails.no", headerName: "SES no" }, // column no 72
    { field: "sesDetails.amount", headerName: "SES Amt" }, // column no 73
    { field: "sesDetails.dateGiven", headerName: "Extra" }, // any change in workflow?
    // { field: "sesDetails.dateGiven", headerName: "Dt given to PIMO for SES" },
    { field: "sesDetails.date", headerName: "SES Dt" }, // column no 74
    { field: "sesDetails.doneBy", headerName: "SES done by" }, // column no 74A
    { field: "pimoMumbai.dateReceivedFromIT", headerName: "Dt ret-IT Dept aft SES" }, // column no 75
    { field: "pimoMumbai.dateReturnedFromSES", headerName: "Dt ret-PIMO aft SES" }, // column no 76
    { field: "approvalDetails.directorApproval.dateGiven", headerName: "Dt given-for approval" }, // column no 77
    { field: "pimoMumbai.dateReturnedFromDirector", headerName: "Dt ret-PIMO aft approval" }, // column no 78
    { field: "approvalDetails.remarksPimoMumbai", headerName: "Remarks PIMO Mumbai" }, // column no 79
    { field: "accountsDept.dateGiven", headerName: "Dt given-Accts" }, // column no 80
    { field: "accountsDept.givenBy", headerName: "Name given-PIMO to Accts" }, // column no 81
    { field: "accountsDept.dateReceived", headerName: "Dt recd-Accts" }, // column no 82
    { field: "accountsDept.receivedBy", headerName: "Name recd-Accts" }, // column no 82A
    { field: "accountsDept.returnedToPimo", headerName: "Dt ret-PIMO by Accts" }, // column no 83
    { field: "accountsDept.receivedBack", headerName: "Dt recd back in Accts" }, // column no 84
    { field: "accountsDept.invBookingChecking", headerName: "Dt given-booking" }, // column no 85
    { field: "accountsDept.paymentInstructions", headerName: "Payment instructions" }, // column no 86
    { field: "accountsDept.remarksForPayInstructions", headerName: "Remarks for payments" }, // column no 87
    { field: "accountsDept.f110Identification", headerName: "F110" }, // column no 88
    { field: "accountsDept.paymentDate", headerName: "Dt of Payment" }, // column no 89
    { field: "accountsDept.hardCopy", headerName: "Hard Copy" }, // column no 89A
    { field: "accountsDept.accountsIdentification", headerName: "Accts Identification" }, // column no 90
    { field: "accountsDept.paymentAmt", headerName: "Payment Amt" }, // column no 91
    { field: "accountsDept.remarksAcctsDept", headerName: "Remarks Accts" }, // column no 92
    { field: "accountsDept.status", headerName: "Payment Status" }, // column no 93
    { field: "miroDetails.number", headerName: "MIRO no" }, // column no 94
    { field: "miroDetails.date", headerName: "MIRO Dt" }, // column no 95
    { field: "miroDetails.amount", headerName: "MIRO Amt" } // column no 96
  ];

  const roleSpecificEditFields = {
    SITE_OFFICER: [
      "srNo",
      "natureOfWork",
      "region",
      "projectDescription",
      "vendorNo",
      "vendorName",
      "poCreated",
      "poNo",
      "poDate",
      "poAmt",
      "proformaInvNo",
      "proformaInvDate",
      "proformaInvAmt",
      "proformaInvRecdAtSite",
      "proformaInvRecdBy",
      "taxInvNo",
      "taxInvDate",
      "currency",
      "taxInvAmt",
      "taxInvRecdAtSite",
      "taxInvRecdBy",
      "department",
      "remarksBySiteTeam",
      "attachments",
      "advanceDate",
      "advanceAmt",
      "advancePercentage",
      "advRequestEnteredBy",
      "migoDetails.no",
      "migoDetails.date",
      "migoDetails.amount",
      "migoDetails.doneBy",
      // "invReturnedToSite",
      "remarks",
      "siteOfficeDispatch.dateGiven",
      "siteOfficeDispatch.name",
      "siteStatus",
    ],

    QS_TEAM: [
      "copDetails.date",
      "copDetails.amount",
      "remarksByQSTeam",
      "pimoMumbai.namePIMO2",
      "qsMeasurementCheck.dateGiven",
    ],

    PIMO_MUMBAI_MIGO_SES: [
      "srNo",
      "natureOfWork",
      "region",
      "projectDescription",
      "vendorNo",
      "vendorName",
      "poCreated",
      "poNo",
      "poDate",
      "poAmt",
      "proformaInvNo",
      "proformaInvDate",
      "proformaInvAmt",
      "proformaInvRecdAtSite",
      "proformaInvRecdBy",
      "taxInvNo",
      "taxInvDate",
      "currency",
      "taxInvAmt",
      "taxInvRecdAtSite",
      "taxInvRecdBy",
      "department",
      "remarksBySiteTeam",
      "attachments",
      "advanceDate",
      "advanceAmt",
      "advancePercentage",
      "advRequestEnteredBy",
      "migoDetails.no",
      "migoDetails.date",
      "migoDetails.amount",
      "migoDetails.doneBy",
      "pimoMumbai.dateReceived",
      "pimoMumbai.receivedBy",
      "sesDetails.no",
      "sesDetails.amount",
      "sesDetails.date",
      "sesDetails.doneBy",
      "approvalDetails.remarksPimoMumbai",
      "accountsDept.givenBy",
    ],

    ACCOUNTS_TEAM: [
      "accountsDept.dateReceived",
      "accountsDept.receivedBy",
      "accountsDept.returnedToPimo",
      "accountsDept.receivedBack",
      "accountsDept.paymentInstructions",
      "accountsDept.remarksForPayInstructions",
      "accountsDept.f110Identification",
      "accountsDept.paymentDate",
      "accountsDept.hardCopy",
      "accountsDept.accountsIdentification",
      "accountsDept.paymentAmt",
      "accountsDept.remarksAcctsDept",
      "miroDetails.number",
      "miroDetails.date",
      "miroDetails.amount",
    ],

    DIRECTOR_TRUSTEE_ADVISOR: [],

    ADMIN: allColumns.map((col) => col.field),
  };

  if (roleSpecificEditFields[role]) {
    return allColumns.filter((column) =>
      roleSpecificEditFields[role].includes(column.field)
    );
  }

  return allColumns.slice(0, 12);
};
