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
    { field: "typeOfInv", headerName: "Type of Invoice" },
    { field: "gstNumber", headerName: "GST Number" },
    { field: "compliance206AB", headerName: "206AB Compliance" },
    { field: "panStatus", headerName: "PAN Status" },
    { field: "poCreated", headerName: "Is PO Created?" },
    { field: "poDate", headerName: "PO Date" },
    { field: "poAmt", headerName: "PO Amount" },
    { field: "proformaInvNo", headerName: "Proforma Invoice No" },
    { field: "proformaInvDate", headerName: "Proforma Invoice Date" },
    { field: "proformaInvAmt", headerName: "Proforma Invoice Amount" },
    { field: "proformaInvRecdAtSite", headerName: "Proforma Invoice Received at Site" },
    { field: "proformaInvRecdBy", headerName: "Proforma Invoice Received By" },
    { field: "currency", headerName: "Currency" },
    { field: "taxInvRecdAtSite", headerName: "Tax Invoice Received at Site" },
    { field: "taxInvRecdBy", headerName: "Tax Invoice Received By" },
    { field: "department", headerName: "Department" },
    { field: "remarksBySiteTeam", headerName: "Remarks by Site Team" },
    { field: "remarksByQSTeam", headerName: "Remarks by QS Team" },
    { field: "attachment", headerName: "Attachment" },
    { field: "attachmentType", headerName: "Attachment Type" },
    { field: "billDate", headerName: "Bill Date" },
    { field: "currentCount", headerName: "Current Count" },
    { field: "advanceDate", headerName: "Advance Date" },
    { field: "advanceAmt", headerName: "Advance Amount" },
    { field: "advancePercentage", headerName: "Advance Percentage" },
    { field: "advRequestEnteredBy", headerName: "Advance Request Entered By" },
    {
      field: "qualityEngineer.dateGiven",
      headerName: "Date Given to Quality Engineer",
    },
    { field: "qualityEngineer.name", headerName: "Name of Quality Engineer" },
    {
      field: "qsForCOP.dateGiven",              //
      headerName: "Date Given to QS for COP",
    },{
      field: "qsInspection.dateGiven",
      headerName: "Date Given to QS for Inspection",
    },
    {
      field: "qsMumbai.dateGiven",
      headerName: "Date Given to QS for Inspection",
    },
    { field: "qsMumbai.dateMeasurement", headerName: "Dt given to QS for Inspection"},  //
    { field: "qsMumbai.givenVendorQuery", headerName: "Given to vendor-Query/Final Inv" },  //
    { field: "qsMumbai.name", headerName: "Name of QS" },
    { field: "copDetails.date", headerName: "COP Date" },
    { field: "migoDetails.dateGiven", headerName: "Date Given for MIGO" },
    { field: "migoDetails.no", headerName: "MIGO No" },
    { field: "migoDetails.date", headerName: "MIGO Date" },
    { field: "migoDetails.amount", headerName: "MIGO Amount" },
    { field: "migoDetails.doneBy", headerName: "MIGO Done By" },
    {
      field: "invReturnedToSite",
      headerName: "Date Invoice Returned to Site Office",
    },
    {
      field: "siteEngineer.dateGiven",
      headerName: "Date Given to Site Engineer",
    },
    { field: "siteEngineer.name", headerName: "Name of Site Engineer" },
    { field: "architect.dateGiven", headerName: "Date Given to Architect" },
    { field: "architect.name", headerName: "Name of Architect" },
    { field: "siteIncharge.dateGiven", headerName: "Date Given-Site Incharge" },
    { field: "siteIncharge.name", headerName: "Name-Site Incharge" },
    { field: "remarks", headerName: "Remarks" },
    {
      field: "siteOfficeDispatch.dateGiven",
      headerName: "Date Given to Site Office for Dispatch",
    },
    { field: "siteOfficeDispatch.name", headerName: "Name-Site Office" },
    { field: "workflowState.currentState", headerName: "Status" },
    { field: "pimoMumbai.dateGiven", headerName: "Date Given to PIMO Mumbai" },
    { field: "pimoMumbai.dateReceived", headerName: "Date Received at PIMO Mumbai" },
    { field: "pimoMumbai.receivedBy", headerName: "Name Received by PIMO Mumbai" },
    { field: "pimoMumbai.namePIMO", headerName: "Name-PIMO" },
    { field: "itDept.dateGiven", headerName: "Date Given to IT Dept" },
    { field: "itDept.name", headerName: "Name Given to IT Dept" },
    { field: "itDept.dateReceived", headerName: "Date Received at IT Dept" },
    { field: "pimoMumbai.namePIMO2", headerName: "Name Given to PIMO" },
    { field: "sesDetails.amount", headerName: "SES Amount" },
    { field: "sesDetails.date", headerName: "SES Date" },
    { field: "sesDetails.doneBy", headerName: "SES Done By" },
    { field: "sesDetails.no", headerName: "SES No" },
    {
      field: "approvalDetails.directorApproval.dateGiven",
      headerName: "Date Given to Director/Advisor/Trustee for Approval",
    },
    {
      field: "approvalDetails.directorApproval.dateReceived",
      headerName: "Date Received Back in PIMO After Approval",
    },
    {
      field: "approvalDetails.remarksPimoMumbai",
      headerName: "Remarks PIMO Mumbai",
    },
    { field: "accountsDept.dateGiven", headerName: "Date Given to Accts Dept" },
    { field: "accountsDept.givenBy", headerName: "Name-Given by PIMO Office" },
    { field: "accountsDept.dateReceived", headerName: "Date Received in Accts Dept" },
    { field: "accountsDept.receivedBy", headerName: "Name Received by Accts Dept" },
    {
      field: "accountsDept.returnedToPimo",
      headerName: "Date Returned Back to PIMO",
    },
    {
      field: "accountsDept.receivedBack",
      headerName: "Date Received Back in Accts Dept",
    },
    {
      field: "accountsDept.invBookingChecking",
      headerName: "Invoice Given for Booking and Checking",
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
    { field: "accountsDept.paymentDate", headerName: "Date of Payment" },
    { field: "accountsDept.hardCopy", headerName: "Hard Copy" },
    {
      field: "accountsDept.accountsIdentification",
      headerName: "Accts Identification",
    },
    { field: "accountsDept.paymentAmt", headerName: "Payment Amount" },
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
      // "attachment",
      "qualityEngineer.dateGiven",
      "qualityEngineer.name",
      "qsInspection.dateGiven",
      "nameOfQS",
      "qsMumbai.dateMeasurement",   //
      "qsMumbai.givenVendorQuery",  //
      "qsMumbai.dateGiven",
      "qsMumbai.name",
      "copDetails.date",
      "copDetails.amount",
      "remarksByQSTeam",
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
      // "department",
      "remarksBySiteTeam",
      // "attachment",
      "advanceDate",
      "advanceAmt",
      "advancePercentage",
      "advRequestEnteredBy",
      "qsInspection.dateGiven",
      "nameOfQS",
      "qsMumbai.dateMeasurement",   //
      "qsMumbai.givenVendorQuery",  //
      "qsMumbai.name",
      "qsMumbai.dateGiven",
      "qsForCOP.dateGiven",         //
      "copDetails.date",
      "copDetails.amount",
      "remarksByQSTeam",
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
      // "department",
      "remarksBySiteTeam",
      // "attachment",
      "advanceDate",
      "advanceAmt",
      "advancePercentage",
      "advRequestEnteredBy",
      // "qualityEngineer.dateGiven",
      // "qualityEngineer.name",
      // "qsInspection.dateGiven",
      // "nameOfQS",
      "copDetails.date",
      "copDetails.amount",
      "remarksByQSTeam",
      "migoDetails.dateGiven",
      "migoDetails.no",
      "migoDetails.date",
      "migoDetails.amount",
      "migoDetails.doneBy",
      // "invReturnedToSite",
      // "siteEngineer.dateGiven",
      // "siteEngineer.name",
      // "architect.dateGiven",
      // "architect.name",
      // "siteIncharge.dateGiven",
      // "siteIncharge.name",
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
      // "itDept.name",
      "pimoMumbai.namePIMO2",
      "sesDetails.no",
      "sesDetails.amount",
      "sesDetails.date",
      // "sesDetails.doneBy",
      "itDept.dateReceived",
      // "approvalDetails.directorApproval.dateGiven",
      "approvalDetails.directorApproval.dateReceived",
      "approvalDetails.remarksPimoMumbai",
      "accountsDept.dateGiven",
      "accountsDept.givenBy",
      "accountsDept.dateReceived",
      "accountsDept.receivedBy",
      "accountsDept.returnedToPimo",
      "accountsDept.receivedBack",
      "accountsDept.remarksForPayInstructions",
      "accountsDept.f110Identification",
      "accountsDept.paymentDate",
      "accountsDept.accountsIdentification",
      "accountsDept.paymentAmt",
      "accountsDept.remarksAcctsDept",
      "accountsDept.status",
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
      // "attachment",
      "advanceDate",
      "advanceAmt",
      "advancePercentage",
      "advRequestEnteredBy",
      "qualityEngineer.givenDate",
      "qualityEngineer.name",
      "qsMumbai.dateMeasurement",   //
      "qsMumbai.givenVendorQuery",  //
      "qsInspection.dateGiven",
      "nameOfQS",
      "copDetails.date",
      "copDetails.amount",
      "remarksByQSTeam",
      // "remarks",
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
      "pimoMumbai.nameGiven",
      "pimoMumbai.dateReceived",
      "pimoMumbai.receivedBy",
      "qsMumbai.dateGiven",
      "qsMumbai.name",
      "pimoMumbai.namePIMO",
      "pimoMumbai.namePIMO2",
      "itDept.dateGiven",
      "sesDetails.amount",
      "sesDetails.date",
      "sesDetails.no",
      "itDept.dateReceived",
      // "approvalDetails.directorApproval.dateGiven",
      "approvalDetails.directorApproval.dateReceived",
      "approvalDetails.remarksPimoMumbai",
      "accountsDept.dateGiven",
      "accountsDept.givenBy",
      "accountsDept.dateReceived",
      "accountsDept.receivedBy",
      "accountsDept.returnedToPimo",
      "accountsDept.receivedBack",
      "accountsDept.remarksForPayInstructions",
      "accountsDept.f110Identification",
      "accountsDept.paymentDate",
      "accountsDept.accountsIdentification",
      "accountsDept.paymentAmt",
      "accountsDept.remarksAcctsDept",
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
      // "attachment",
      "advanceDate",
      "advanceAmt",
      "advancePercentage",
      "advRequestEnteredBy",
      // "copDetails.date",
      "copDetails.amount",
      // "remarksByQSTeam",
      // "migoDetails.dateGiven",
      // "migoDetails.no",
      // "migoDetails.date",
      // "migoDetails.amount",
      // "migoDetails.doneBy",
      // "remarks",
      // "workflowState.currentState",
      "pimoMumbai.dateGiven",
      "pimoMumbai.dateReceived",
      // "pimoMumbai.receivedBy",
      // "sesDetails.amount",
      // "sesDetails.date",
      // "sesDetails.doneBy",
      // "sesDetails.no",
      // "approvalDetails.directorApproval.dateGiven",
      // "approvalDetails.directorApproval.dateReceived",
      "approvalDetails.remarksPimoMumbai",
      "accountsDept.dateGiven",
      "accountsDept.givenBy",
      "accountsDept.dateReceived",
      "accountsDept.receivedBy",
      "accountsDept.returnedToPimo",
      "accountsDept.receivedBack",
      "accountsDept.invBookingChecking",
      "accountsDept.paymentInstructions",
      "accountsDept.remarksForPayInstructions",
      "accountsDept.f110Identification",
      "accountsDept.paymentDate",
      "accountsDept.hardCopy",
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
      "remarksBySiteTeam",
      "advanceDate",
      "advanceAmt",
      "advancePercentage",
      "advRequestEnteredBy",
      "qualityEngineer.dateGiven",
      "qualityEngineer.name",
      "qsInspection.dateGiven",
      "nameOfQS",
      "qsMumbai.dateMeasurement",   //
      "copDetails.amount",
      "remarksByQSTeam",
      "migoDetails.dateGiven",
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
      "pimoMumbai.namePIMO2",
      "itDept.dateGiven",
      "itDept.dateReceived",
      "sesDetails.amount",
      "sesDetails.date",
      "sesDetails.no",
      "approvalDetails.directorApproval.dateGiven",
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

    ADMIN: allColumns.map((col) => col.field),
  };

  if (roleSpecificFields[role]) {
    return allColumns.filter((column) =>
      roleSpecificFields[role].includes(column.field)
    );
  }  
  return allColumns.slice(0, 12);
  
};
