import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
  type Transaction,
} from "plaid";

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = (process.env.PLAID_ENV || "sandbox") as keyof typeof PlaidEnvironments;

function getClient(): PlaidApi {
  if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
    throw new Error("PLAID_CLIENT_ID and PLAID_SECRET must be set");
  }
  const configuration = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
        "PLAID-SECRET": PLAID_SECRET,
      },
    },
  });
  return new PlaidApi(configuration);
}

/** True when Plaid API credentials are present (Link and server calls can run). */
export function isPlaidConfigured(): boolean {
  return Boolean(PLAID_CLIENT_ID && PLAID_SECRET);
}

export function plaidConfigErrorMessage(): string {
  if (isPlaidConfigured()) return "";
  return "Plaid is not configured. Add PLAID_CLIENT_ID and PLAID_SECRET to the server environment.";
}

/**
 * Create a Link token for the Plaid Link widget.
 * Requests Auth + Transactions so balances work and transaction sync does not require re-link.
 */
export async function createLinkToken(userId: string): Promise<string> {
  const client = getClient();
  const response = await client.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: "HSA Plus",
    products: [Products.Auth, Products.Transactions],
    country_codes: [CountryCode.Us],
    language: "en",
    transactions: {
      days_requested: 90,
    },
    account_filters: {
      depository: {
        account_subtypes: ["savings" as never, "checking" as never, "hsa" as never],
      },
    },
  });
  return response.data.link_token;
}

/**
 * Exchange a public token from Plaid Link for an access token
 */
export async function exchangePublicToken(publicToken: string) {
  const client = getClient();
  const response = await client.itemPublicTokenExchange({
    public_token: publicToken,
  });
  return {
    accessToken: response.data.access_token,
    itemId: response.data.item_id,
  };
}

/**
 * Fetch account balances from Plaid
 */
export async function getBalance(accessToken: string, accountId?: string | null) {
  const client = getClient();
  const response = await client.accountsBalanceGet({
    access_token: accessToken,
    ...(accountId ? { options: { account_ids: [accountId] } } : {}),
  });

  const accounts = response.data.accounts;
  if (accountId) {
    const account = accounts.find((a) => a.account_id === accountId);
    return account?.balances.current ?? 0;
  }

  return accounts[0]?.balances.current ?? 0;
}

/**
 * Remove a Plaid item (disconnect)
 */
export async function removeItem(accessToken: string) {
  const client = getClient();
  await client.itemRemove({ access_token: accessToken });
}

/** Result of one /transactions/sync pagination step */
export interface TransactionsSyncPageResult {
  added: Transaction[];
  modified: Transaction[];
  removed: { transaction_id: string }[];
  nextCursor: string;
  hasMore: boolean;
}

/**
 * Single page of transaction updates (call in a loop until hasMore is false).
 * When `accountId` is set, Plaid maintains a separate cursor stream for that account (required for single HSA account links).
 */
export async function transactionsSyncPage(
  accessToken: string,
  cursor: string | null,
  accountId?: string | null
): Promise<TransactionsSyncPageResult> {
  const client = getClient();
  const response = await client.transactionsSync({
    access_token: accessToken,
    cursor: cursor ?? undefined,
    ...(accountId
      ? { options: { account_id: accountId } }
      : {}),
  });
  const data = response.data;
  return {
    added: data.added,
    modified: data.modified,
    removed: data.removed,
    nextCursor: data.next_cursor,
    hasMore: data.has_more,
  };
}

/**
 * Pull all pending transaction updates until cursor is current.
 */
export async function transactionsSyncAll(
  accessToken: string,
  initialCursor: string | null,
  accountId?: string | null
): Promise<{
  nextCursor: string;
  added: Transaction[];
  modified: Transaction[];
  removed: { transaction_id: string }[];
}> {
  const added: Transaction[] = [];
  const modified: Transaction[] = [];
  const removed: { transaction_id: string }[] = [];
  let cursor: string | null = initialCursor;
  let nextCursor = "";
  let hasMore = true;

  while (hasMore) {
    const page = await transactionsSyncPage(accessToken, cursor, accountId);
    added.push(...page.added);
    modified.push(...page.modified);
    removed.push(...page.removed);
    nextCursor = page.nextCursor;
    hasMore = page.hasMore;
    cursor = page.nextCursor;
  }

  return { nextCursor, added, modified, removed };
}

export function isPlaidLoginRequiredError(err: unknown): boolean {
  if (err && typeof err === "object" && "response" in err) {
    const res = err as { response?: { data?: { error_code?: string } } };
    return res.response?.data?.error_code === "ITEM_LOGIN_REQUIRED";
  }
  return false;
}

export function getPlaidErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const data = (err as { response?: { data?: { error_message?: string } } }).response?.data;
    if (data?.error_message) return data.error_message;
  }
  if (err instanceof Error) return err.message;
  return "Unknown Plaid error";
}
