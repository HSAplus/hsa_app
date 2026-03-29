const WESTFAX_API_URL =
  process.env.WESTFAX_API_URL ?? "https://api2.westfax.com/REST/Fax_SendFax/json";
const WESTFAX_USERNAME = process.env.WESTFAX_USERNAME ?? "";
const WESTFAX_PASSWORD = process.env.WESTFAX_PASSWORD ?? "";
const WESTFAX_PRODUCT_ID = process.env.WESTFAX_PRODUCT_ID ?? "";

export interface WestFaxSendResult {
  success: boolean;
  faxId: string | null;
  error: string | null;
}

/**
 * Send a fax via WestFax HIPAA-compliant API.
 *
 * WestFax REST API accepts multipart/form-data with:
 * - Username, Password, Cookies (auth)
 * - ProductId (account identifier)
 * - Numbers1 (destination fax number)
 * - Files0, Files1, ... (PDF/image attachments)
 * - JobName (optional label)
 */
export async function sendFax(params: {
  destinationNumber: string;
  pdfBuffers: { filename: string; buffer: Buffer }[];
  jobName?: string;
}): Promise<WestFaxSendResult> {
  if (!WESTFAX_USERNAME || !WESTFAX_PASSWORD || !WESTFAX_PRODUCT_ID) {
    return {
      success: false,
      faxId: null,
      error: "WestFax credentials not configured",
    };
  }

  const formData = new FormData();
  formData.append("Username", WESTFAX_USERNAME);
  formData.append("Password", WESTFAX_PASSWORD);
  formData.append("Cookies", "");
  formData.append("ProductId", WESTFAX_PRODUCT_ID);
  formData.append("Numbers1", params.destinationNumber);
  formData.append("JobName", params.jobName ?? "HSA Claim Submission");

  for (let i = 0; i < params.pdfBuffers.length; i++) {
    const { filename, buffer } = params.pdfBuffers[i];
    const blob = new Blob([buffer], { type: "application/pdf" });
    formData.append(`Files${i}`, blob, filename);
  }

  const response = await fetch(WESTFAX_API_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return {
      success: false,
      faxId: null,
      error: `WestFax API error: ${response.status} ${response.statusText}`,
    };
  }

  const result = await response.json();

  // WestFax returns { Success: bool, Result: "fax-id", ErrorString: "..." }
  if (result.Success) {
    return {
      success: true,
      faxId: result.Result,
      error: null,
    };
  }

  return {
    success: false,
    faxId: null,
    error: result.ErrorString ?? "Unknown WestFax error",
  };
}
