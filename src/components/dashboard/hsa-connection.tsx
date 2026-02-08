"use client";

import { useState, useEffect, useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Button } from "@/components/ui/button";
import { Loader2, Link2, RefreshCw, Unlink, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/hsa-constants";
import type { HsaConnection } from "@/lib/types";
import {
  createPlaidLinkToken,
  connectHsaAccount,
  syncHsaBalance,
  disconnectHsaAccount,
  getHsaConnection,
} from "@/app/dashboard/actions";

interface HsaConnectionProps {
  onBalanceUpdate?: (balance: number) => void;
}

export function HsaConnectionWidget({ onBalanceUpdate }: HsaConnectionProps) {
  const [connection, setConnection] = useState<HsaConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    getHsaConnection().then((conn) => {
      setConnection(conn);
      setLoading(false);
    });
  }, []);

  const initPlaidLink = async () => {
    setConnecting(true);
    const result = await createPlaidLinkToken();
    if (result.error) {
      toast.error(result.error);
      setConnecting(false);
      return;
    }
    setLinkToken(result.linkToken ?? null);
  };

  const onPlaidSuccess = useCallback(
    async (publicToken: string, metadata: { institution?: { name?: string; institution_id?: string } | null; account?: { id?: string; name?: string } }) => {
      const result = await connectHsaAccount(publicToken, {
        institution: metadata.institution ?? undefined,
        account: metadata.account,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Connected to ${metadata.institution?.name ?? "your HSA"}`);
        const conn = await getHsaConnection();
        setConnection(conn);
      }
      setConnecting(false);
      setLinkToken(null);
    },
    []
  );

  const onPlaidExit = useCallback(() => {
    setConnecting(false);
    setLinkToken(null);
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  });

  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  const handleSync = async () => {
    setSyncing(true);
    const result = await syncHsaBalance();
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Balance updated: ${formatCurrency(result.balance ?? 0)}`);
      onBalanceUpdate?.(result.balance ?? 0);
      const conn = await getHsaConnection();
      setConnection(conn);
    }
    setSyncing(false);
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    const result = await disconnectHsaAccount();
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("HSA account disconnected");
      setConnection(null);
    }
    setDisconnecting(false);
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <div className="h-4 w-32 animate-pulse rounded bg-[#F1F5F9]" />
      </div>
    );
  }

  if (connection) {
    const lastSynced = connection.last_synced_at
      ? new Date(connection.last_synced_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "Never";

    return (
      <div className="rounded-lg border border-[#059669]/20 bg-[#059669]/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2 bg-[#059669]/10">
              <Building2 className="h-4 w-4 text-[#059669]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-[#0F172A]">
                  {connection.institution_name || "HSA Account"}
                </p>
                <CheckCircle2 className="h-3.5 w-3.5 text-[#059669]" />
              </div>
              <p className="text-[11px] text-[#64748B]">
                {connection.account_name ? `${connection.account_name} · ` : ""}
                Synced {lastSynced}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={syncing}
              className="h-7 text-[11px] px-2"
            >
              {syncing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Sync
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="h-7 text-[11px] px-2 text-[#94A3B8] hover:text-red-500"
            >
              {disconnecting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Unlink className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2 bg-[#F1F5F9]">
            <Link2 className="h-4 w-4 text-[#94A3B8]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#0F172A]">Connect your HSA</p>
            <p className="text-[11px] text-[#94A3B8]">Auto-sync your balance from Fidelity, Lively, etc.</p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={initPlaidLink}
          disabled={connecting}
          className="h-8 text-[13px]"
        >
          {connecting ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Link2 className="h-3.5 w-3.5 mr-1.5" />
          )}
          Connect
        </Button>
      </div>
    </div>
  );
}
