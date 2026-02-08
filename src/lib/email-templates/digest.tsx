import * as React from "react";

interface DigestEmailProps {
  firstName: string;
  periodLabel: string; // e.g. "January 2026" or "Week of Jan 27"
  hsaBalance: number;
  totalExpenses: number;
  pendingReimbursement: number;
  newExpenseCount: number;
  reimbursedThisPeriod: number;
  projectedGrowth: number;
  timeHorizon: number;
  annualReturn: number;
  auditReadyPct: number;
  topExpenses: Array<{ description: string; amount: number; date: string }>;
}

function formatMoney(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function DigestEmail({
  firstName,
  periodLabel,
  hsaBalance,
  totalExpenses,
  pendingReimbursement,
  newExpenseCount,
  reimbursedThisPeriod,
  projectedGrowth,
  timeHorizon,
  annualReturn,
  auditReadyPct,
  topExpenses,
}: DigestEmailProps) {
  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #059669, #34d399)",
          padding: "32px 24px",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <h1
          style={{
            color: "#ffffff",
            fontSize: "22px",
            fontWeight: 700,
            margin: 0,
          }}
        >
          HSA Plus
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "14px",
            margin: "4px 0 0",
          }}
        >
          Your {periodLabel} Summary
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: "24px" }}>
        <p
          style={{
            fontSize: "15px",
            color: "#0F172A",
            margin: "0 0 20px",
          }}
        >
          Hi {firstName},
        </p>
        <p
          style={{
            fontSize: "14px",
            color: "#64748B",
            margin: "0 0 24px",
            lineHeight: "1.6",
          }}
        >
          Here&apos;s a snapshot of your HSA activity for {periodLabel}.
        </p>

        {/* Stats grid */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "24px",
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: "12px", border: "1px solid #F1F5F9", width: "50%" }}>
                <p style={{ fontSize: "11px", color: "#94A3B8", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  HSA Balance
                </p>
                <p style={{ fontSize: "20px", fontWeight: 700, color: "#0F172A", margin: 0, fontFamily: "monospace" }}>
                  {formatMoney(hsaBalance)}
                </p>
              </td>
              <td style={{ padding: "12px", border: "1px solid #F1F5F9", width: "50%" }}>
                <p style={{ fontSize: "11px", color: "#94A3B8", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Pending Reimbursement
                </p>
                <p style={{ fontSize: "20px", fontWeight: 700, color: "#0F172A", margin: 0, fontFamily: "monospace" }}>
                  {formatMoney(pendingReimbursement)}
                </p>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "12px", border: "1px solid #F1F5F9" }}>
                <p style={{ fontSize: "11px", color: "#94A3B8", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Total Expenses
                </p>
                <p style={{ fontSize: "18px", fontWeight: 600, color: "#0F172A", margin: 0, fontFamily: "monospace" }}>
                  {formatMoney(totalExpenses)}
                </p>
              </td>
              <td style={{ padding: "12px", border: "1px solid #F1F5F9" }}>
                <p style={{ fontSize: "11px", color: "#94A3B8", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Projected Growth
                </p>
                <p style={{ fontSize: "18px", fontWeight: 600, color: "#059669", margin: 0, fontFamily: "monospace" }}>
                  +{formatMoney(projectedGrowth)}
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Activity summary */}
        <div
          style={{
            background: "#F8FAFC",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#64748B", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            This Period
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ fontSize: "13px", color: "#64748B", padding: "4px 0" }}>
                  New expenses added
                </td>
                <td style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A", textAlign: "right", padding: "4px 0", fontFamily: "monospace" }}>
                  {newExpenseCount}
                </td>
              </tr>
              <tr>
                <td style={{ fontSize: "13px", color: "#64748B", padding: "4px 0" }}>
                  Reimbursed this period
                </td>
                <td style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A", textAlign: "right", padding: "4px 0", fontFamily: "monospace" }}>
                  {formatMoney(reimbursedThisPeriod)}
                </td>
              </tr>
              <tr>
                <td style={{ fontSize: "13px", color: "#64748B", padding: "4px 0" }}>
                  Audit readiness
                </td>
                <td style={{ fontSize: "13px", fontWeight: 600, color: auditReadyPct >= 80 ? "#059669" : "#f59e0b", textAlign: "right", padding: "4px 0", fontFamily: "monospace" }}>
                  {auditReadyPct}%
                </td>
              </tr>
              <tr>
                <td style={{ fontSize: "13px", color: "#64748B", padding: "4px 0" }}>
                  Growth projection
                </td>
                <td style={{ fontSize: "13px", fontWeight: 600, color: "#64748B", textAlign: "right", padding: "4px 0", fontFamily: "monospace" }}>
                  {annualReturn}% × {timeHorizon} yrs
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Top expenses */}
        {topExpenses.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#64748B", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Recent Expenses
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {topExpenses.map((exp, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ fontSize: "13px", color: "#0F172A", padding: "8px 0" }}>
                      {exp.description}
                    </td>
                    <td style={{ fontSize: "12px", color: "#94A3B8", padding: "8px 8px", whiteSpace: "nowrap" }}>
                      {exp.date}
                    </td>
                    <td style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A", textAlign: "right", padding: "8px 0", fontFamily: "monospace" }}>
                      {formatMoney(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: "center", margin: "24px 0" }}>
          <a
            href={process.env.NEXT_PUBLIC_APP_URL ?? "https://hsaplus.app"}
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #059669, #34d399)",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              padding: "10px 24px",
              borderRadius: "8px",
            }}
          >
            View Dashboard
          </a>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid #F1F5F9",
          textAlign: "center" as const,
        }}
      >
        <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0 }}>
          You&apos;re receiving this because you enabled email digests in your HSA Plus
          profile settings. Manage your preferences in{" "}
          <a
            href={`${process.env.NEXT_PUBLIC_APP_URL ?? "https://hsaplus.app"}/dashboard/profile`}
            style={{ color: "#059669", textDecoration: "underline" }}
          >
            Profile settings
          </a>
          .
        </p>
      </div>
    </div>
  );
}
