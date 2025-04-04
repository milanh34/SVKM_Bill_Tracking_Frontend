export const getColumnsForRole = (role) => {
  const allColumns = [
    { field: "srNo", headerName: "Sr. No" },
    { field: "srNoOld", headerName: "Sr No Old" },
    { field: "projectDescription", headerName: "Project Description" },
    { field: "vendorNo", headerName: "Vendor No." },
    { field: "vendorName", headerName: "Vendor Name" },
    { field: "region", headerName: "Region" },
    { field: "taxInvNo", headerName: "Tax Invoice No." },
    { field: "taxInvAmt", headerName: "Tax Invoice Amount" },
    { field: "taxInvDate", headerName: "Tax Invoice Date" },
    { field: "poNo", headerName: "PO No." },
    { field: "copDetails.amount", headerName: "COP Amount" },
    { field: "accountsDept.status", headerName: "Payment Status" },
    { field: "typeOfInv", headerName: "Type of Inv" },
    { field: "gstNumber", headerName: "GST Number" },
    { field: "compliance206AB", headerName: "206AB Compliance" },
    { field: "panStatus", headerName: "PAN Status" },
    { field: "poCreated", headerName: "If PO Created?" },
    { field: "poDate", headerName: "PO Dt" },
    { field: "poAmt", headerName: "PO Amt" },
    { field: "proformaInvNo", headerName: "Proforma Inv No" },
    { field: "proformaInvDate", headerName: "Proforma Inv Dt" },
    { field: "proformaInvAmt", headerName: "Proforma Inv Amt" },
    { field: "proformaInvRecdAtSite", headerName: "Proforma Inv Recd at Site" },
    { field: "proformaInvRecdBy", headerName: "Proforma Inv Recd By" },
    { field: "currency", headerName: "Currency" },
    { field: "taxInvRecdAtSite", headerName: "Tax Inv Recd at Site" },
    { field: "taxInvRecdBy", headerName: "Tax Inv Recd By" },
    { field: "department", headerName: "Department" },
    { field: "remarksBySiteTeam", headerName: "Remarks by Site Team" },
    { field: "attachment", headerName: "Attachment" },
    { field: "advanceDate", headerName: "Advance Dt" },
    { field: "advanceAmt", headerName: "Advance Amt" },
    { field: "advancePercentage", headerName: "Advance Percentage" },
    { field: "advRequestEnteredBy", headerName: "Adv Request Entered By" },
    {
      field: "qualityEngineer.dateGiven",
      headerName: "Dt Given to Quality Engineer",
    },
    { field: "qualityEngineer.name", headerName: "Name of Quality Engineer" },
    {
      field: "qsMumbai.dateGiven",
      headerName: "Dt Given to QS for Inspection",
    },
    { field: "qsMumbai.name", headerName: "Name of QS" },
    { field: "copDetails.date", headerName: "COP Dt" },
    { field: "migoDetails.dateGiven", headerName: "Dt Given for MIGO" },
    { field: "migoDetails.no", headerName: "MIGO No" },
    { field: "migoDetails.date", headerName: "MIGO Dt" },
    { field: "migoDetails.amount", headerName: "MIGO Amt" },
    { field: "migoDetails.doneBy", headerName: "MIGO Done By" },
    {
      field: "invReturnedToSite",
      headerName: "Dt-Inv Returned to Site Office",
    },
    {
      field: "siteEngineer.dateGiven",
      headerName: "Dt Given to Site Engineer",
    },
    { field: "siteEngineer.name", headerName: "Name of Site Engineer" },
    { field: "architect.dateGiven", headerName: "Dt Given to Architect" },
    { field: "architect.name", headerName: "Name of Architect" },
    { field: "siteIncharge.dateGiven", headerName: "Dt Given-Site Incharge" },
    { field: "siteIncharge.name", headerName: "Name-Site Incharge" },
    { field: "remarks", headerName: "Remarks" },
    {
      field: "siteOfficeDispatch.dateGiven",
      headerName: "Dt Given to Site Office for Dispatch",
    },
    { field: "siteOfficeDispatch.name", headerName: "Name-Site Office" },
    { field: "workflowState.currentState", headerName: "Status" },
    { field: "pimoMumbai.dateGiven", headerName: "Dt Given to PIMO Mumbai" },
    { field: "pimoMumbai.dateReceived", headerName: "Dt Recd at PIMO Mumbai" },
    { field: "pimoMumbai.receivedBy", headerName: "Name Recd by PIMO Mumbai" },
    { field: "qsMumbai.dateGiven", headerName: "Dt Given to QS Mumbai" },
    { field: "qsMumbai.name", headerName: "Name of QS" },
    { field: "pimoMumbai.namePIMO", headerName: "Name-PIMO" },
    { field: "itDept.dateGiven", headerName: "Dt Given to IT Dept" },
    { field: "itDept.name", headerName: "Name- Given to IT Dept" },
    { field: "pimoMumbai.namePIMO2", headerName: "Name-Given to PIMO" },
    {
      field: "approvalDetails.directorApproval.dateGiven",
      headerName: "Dt Given to Director/Advisor/Trustee for Approval",
    },
    {
      field: "approvalDetails.directorApproval.dateReceived",
      headerName: "Dt Recd Back in PIMO After Approval",
    },
    {
      field: "approvalDetails.remarksPimoMumbai",
      headerName: "Remarks PIMO Mumbai",
    },
    { field: "accountsDept.dateGiven", headerName: "Dt Given to Accts Dept" },
    { field: "accountsDept.givenBy", headerName: "Name-Given by PIMO Office" },
    { field: "accountsDept.dateReceived", headerName: "Dt Recd in Accts Dept" },
    { field: "accountsDept.receivedBy", headerName: "Name Recd by Accts Dept" },
    {
      field: "accountsDept.returnedToPimo",
      headerName: "Dt Returned Back to PIMO",
    },
    {
      field: "accountsDept.receivedBack",
      headerName: "Dt Recd Back in Accts Dept",
    },
    {
      field: "accountsDept.invBookingChecking",
      headerName: "Inv Given for Booking and Checking",
    },
    {
      field: "accountsDept.paymentInstructions",
      headerName: "Payment Instructions",
    },
    {
      field: "accountsDept.remarksForPayInstructions",
      headerName: "Remarks for Pay Instructions",
    },
    {
      field: "accountsDept.f110Identification",
      headerName: "F110 Identification",
    },
    { field: "accountsDept.paymentDate", headerName: "Dt of Payment" },
    { field: "accountsDept.hardCopy", headerName: "Hard Copy" },
    {
      field: "accountsDept.accountsIdentification",
      headerName: "Accts Identification",
    },
    { field: "accountsDept.paymentAmt", headerName: "Payment Amt" },
    {
      field: "accountsDept.remarksAcctsDept",
      headerName: "Remarks Accts Dept",
    },
  ];

  const roleSpecificFields = {
    SITE_OFFICER: [
      "srNo",
      "srNoOld",
      "typeOfInv",
      "region",
      "projectDescription",
      "vendorNo",
      "vendorName",
      "gstNumber",
      "compliance206AB",
      "panStatus",
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
      "attachment",
      "qualityEngineer.dateGiven",
      "qualityEngineer.name",
      "qsMumbai.dateGiven",
      "qsMumbai.name",
      "copDetails.date",
      "copDetails.amount",
      "migoDetails.dateGiven",
      "migoDetails.no",
      "migoDetails.date",
      "migoDetails.amount",
      "migoDetails.doneBy",
      "invReturnedToSite",
      "siteEngineer.dateGiven",
      "siteEngineer.name",
      "architect.dateGiven",
      "architect.name",
      "siteIncharge.dateGiven",
      "siteIncharge.name",
      "remarks",
      "siteOfficeDispatch.dateGiven",
      "siteOfficeDispatch.name",
      "workflowState.currentState",
      "pimoMumbai.dateGiven",
      "pimoMumbai.dateReceived",
      "pimoMumbai.receivedBy",
      "qsMumbai.dateGiven",
      "qsMumbai.name",
      "pimoMumbai.namePIMO",
    ],

    QS_TEAM: [
      "srNo",
      "srNoOld",
      "typeOfInv",
      "region",
      "projectDescription",
      "vendorNo",
      "vendorName",
      "gstNumber",
      "compliance206AB",
      "panStatus",
      "poCreated",
      "poNo",
      "poDate",
      "poAmt",
      "proformaInvNo",
      "proformaInvDate",
      "proformaInvAmt",
      "taxInvNo",
      "taxInvDate",
      "currency",
      "taxInvAmt",
      "remarksBySiteTeam",
      "qsMumbai.dateGiven",
      "qsMumbai.name",
      "copDetails.date",
      "copDetails.amount",
      "remarks",
      "workflowState.currentState",
      "pimoMumbai.dateGiven",
      "pimoMumbai.namePIMO",
    ],

    PIMO_MUMBAI_MIGO_SES: [
      "srNo",
      "srNoOld",
      "typeOfInv",
      "region",
      "projectDescription",
      "vendorNo",
      "vendorName",
      "gstNumber",
      "compliance206AB",
      "panStatus",
      "poCreated",
      "poNo",
      "poDate",
      "poAmt",
      "proformaInvNo",
      "proformaInvDate",
      "proformaInvAmt",
      "taxInvNo",
      "taxInvDate",
      "currency",
      "taxInvAmt",
      "taxInvRecdAtSite",
      "taxInvRecdBy",
      "remarksBySiteTeam",
      "qsMumbai.dateGiven",
      "copDetails.date",
      "copDetails.amount",
      "migoDetails.dateGiven",
      "migoDetails.no",
      "migoDetails.date",
      "migoDetails.amount",
      "migoDetails.doneBy",
      "siteOfficeDispatch.dateGiven",
      "siteOfficeDispatch.name",
      "workflowState.currentState",
      "pimoMumbai.dateGiven",
      "pimoMumbai.dateReceived",
      "pimoMumbai.receivedBy",
      "qsMumbai.dateGiven",
      "qsMumbai.name",
      "pimoMumbai.namePIMO",
      "itDept.dateGiven",
      "pimoMumbai.namePIMO2",
      "approvalDetails.directorApproval.dateReceived",
      "approvalDetails.remarksPimoMumbai",
      "accountsDept.dateGiven",
      "accountsDept.givenBy",
    ],

    PIMO_MUMBAI_ADVANCE_FI: [
      "srNo",
      "srNoOld",
      "typeOfInv",
      "region",
      "projectDescription",
      "vendorNo",
      "vendorName",
      "gstNumber",
      "compliance206AB",
      "panStatus",
      "poCreated",
      "poNo",
      "poDate",
      "poAmt",
      "proformaInvNo",
      "proformaInvDate",
      "proformaInvAmt",
      "taxInvNo",
      "taxInvDate",
      "currency",
      "taxInvAmt",
      "taxInvRecdAtSite",
      "taxInvRecdBy",
      "remarksBySiteTeam",
      "advanceDate",
      "advanceAmt",
      "advancePercentage",
      "advRequestEnteredBy",
      "qualityEngineer.dateGiven",
      "qualityEngineer.name",
      "qsMumbai.dateGiven",
      "qsMumbai.name",
      "copDetails.date",
      "copDetails.amount",
      "migoDetails.dateGiven",
      "migoDetails.no",
      "migoDetails.date",
      "migoDetails.amount",
      "migoDetails.doneBy",
      "invReturnedToSite",
      "siteEngineer.dateGiven",
      "siteEngineer.name",
      "architect.dateGiven",
      "architect.name",
      "siteIncharge.dateGiven",
      "siteIncharge.name",
      "remarks",
      "siteOfficeDispatch.dateGiven",
      "siteOfficeDispatch.name",
      "workflowState.currentState",
      "pimoMumbai.dateGiven",
      "pimoMumbai.dateReceived",
      "pimoMumbai.receivedBy",
      "qsMumbai.dateGiven",
      "qsMumbai.name",
      "pimoMumbai.namePIMO",
      "itDept.dateGiven",
      "pimoMumbai.namePIMO2",
      "approvalDetails.directorApproval.dateReceived",
      "approvalDetails.remarksPimoMumbai",
      "accountsDept.dateGiven",
      "accountsDept.givenBy",
      "accountsDept.dateReceived",
      "accountsDept.returnedToPimo",
      "accountsDept.receivedBack",
      "accountsDept.remarksForPayInstructions",
      "accountsDept.f110Identification",
      "accountsDept.paymentDate",
      "accountsDept.accountsIdentification",
      "accountsDept.paymentAmt",
      "accountsDept.status",
    ],

    ACCOUNTS_TEAM: [
      "srNo",
      "srNoOld",
      "typeOfInv",
      "region",
      "projectDescription",
      "vendorNo",
      "vendorName",
      "gstNumber",
      "compliance206AB",
      "panStatus",
      "taxInvNo",
      "taxInvDate",
      "currency",
      "taxInvAmt",
      "taxInvRecdAtSite",
      "taxInvRecdBy",
      "department",
      "remarksBySiteTeam",
      "advanceDate",
      "advanceAmt",
      "advancePercentage",
      "advRequestEnteredBy",
      "copDetails.amount",
      "migoDetails.no",
      "migoDetails.date",
      "migoDetails.amount",
      "migoDetails.doneBy",
      "workflowState.currentState",
      "pimoMumbai.dateGiven",
      "pimoMumbai.dateReceived",
      "pimoMumbai.receivedBy",
      "qsMumbai.dateGiven",
      "qsMumbai.name",
      "pimoMumbai.namePIMO",
      "approvalDetails.directorApproval.dateReceived",
      "approvalDetails.remarksPimoMumbai",
      "accountsDept.dateGiven",
      "accountsDept.givenBy",
      "accountsDept.dateReceived",
      "accountsDept.returnedToPimo",
      "accountsDept.receivedBack",
      "accountsDept.paymentInstructions",
      "accountsDept.remarksForPayInstructions",
      "accountsDept.f110Identification",
      "accountsDept.paymentDate",
      "accountsDept.accountsIdentification",
      "accountsDept.paymentAmt",
      "accountsDept.remarksAcctsDept",
      "accountsDept.status",
    ],

    DIRECTOR_TRUSTEE_ADVISOR: [
      "srNo",
      "srNoOld",
      "typeOfInv",
      "region",
      "projectDescription",
      "vendorNo",
      "vendorName",
      "gstNumber",
      "compliance206AB",
      "panStatus",
      "poCreated",
      "poNo",
      "poDate",
      "poAmt",
      "proformaInvNo",
      "proformaInvDate",
      "proformaInvAmt",
      "taxInvNo",
      "taxInvDate",
      "currency",
      "taxInvAmt",
      "taxInvRecdAtSite",
      "taxInvRecdBy",
      "department",
      "remarksBySiteTeam",
      "advanceDate",
      "advanceAmt",
      "advancePercentage",
      "advRequestEnteredBy",
      "qualityEngineer.dateGiven",
      "qualityEngineer.name",
      "qsMumbai.dateGiven",
      "qsMumbai.name",
      "copDetails.amount",
      "remarks",
      "migoDetails.no",
      "migoDetails.date",
      "migoDetails.amount",
      "migoDetails.doneBy",
      "siteEngineer.dateGiven",
      "siteEngineer.name",
      "architect.dateGiven",
      "architect.name",
      "siteIncharge.dateGiven",
      "siteIncharge.name",
      "remarks",
      "siteOfficeDispatch.dateGiven",
      "siteOfficeDispatch.name",
      "workflowState.currentState",
      "pimoMumbai.dateGiven",
      "pimoMumbai.dateReceived",
      "pimoMumbai.receivedBy",
      "qsMumbai.dateGiven",
      "qsMumbai.name",
      "pimoMumbai.namePIMO",
      "approvalDetails.directorApproval.dateGiven",
      "approvalDetails.directorApproval.dateReceived",
      "approvalDetails.remarksPimoMumbai",
      "accountsDept.dateGiven",
      "accountsDept.givenBy",
      "accountsDept.paymentInstructions",
      "accountsDept.remarksForPayInstructions",
      "accountsDept.f110Identification",
      "accountsDept.paymentDate",
      "accountsDept.accountsIdentification",
      "accountsDept.paymentAmt",
      "accountsDept.remarksAcctsDept",
      "accountsDept.status",
    ],

    ADMIN: allColumns.map((col) => col.field),
  };

  if (roleSpecificFields[role]) {
    return allColumns.filter((column) =>
      roleSpecificFields[role].includes(column.field)
    );
  }
  return allColumns.slice(0, 12);
};
