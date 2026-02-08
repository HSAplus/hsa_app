import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from "plaid";

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID!;
const PLAID_SECRET = process.env.PLAID_SECRET!;
const PLAID_ENV = (process.env.PLAID_ENV || "sandbox") as keyof typeof PlaidEnvironments;

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
      "PLAID-SECRET": PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

/**
 * Create a Link token for the Plaid Link widget
 */
export async function createLinkToken(userId: string): Promise<string> {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: "HSA Plus",
    products: [Products.Auth],
    country_codes: [CountryCode.Us],
    language: "en",
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
  const response = await plaidClient.itemPublicTokenExchange({
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
  const response = await plaidClient.accountsBalanceGet({
    access_token: accessToken,
    ...(accountId ? { options: { account_ids: [accountId] } } : {}),
  });

  const accounts = response.data.accounts;
  if (accountId) {
    const account = accounts.find((a) => a.account_id === accountId);
    return account?.balances.current ?? 0;
  }

  // Return the first account's balance
  return accounts[0]?.balances.current ?? 0;
}

/**
 * Remove a Plaid item (disconnect)
 */
export async function removeItem(accessToken: string) {
  await plaidClient.itemRemove({ access_token: accessToken });
}
