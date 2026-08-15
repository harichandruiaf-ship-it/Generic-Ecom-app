"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

type ExpandedChart = "revenue" | "status" | "topProducts" | "ordersPerDay" | null;

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  PROCESSING: "#3b82f6",
  SHIPPED: "#8b5cf6",
  DELIVERED: "#22c55e",
  CANCELLED: "#6b7280",
};

const CHART_COLORS = ["#ec4899", "#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b", "#6366f1", "#f43f5e", "#14b8a6"];

export type RevenueByDay = { date: string; revenue: number; orders: number };
export type OrdersByStatus = { status: string; count: number };
export type TopProduct = { name: string; quantity: number };

type DashboardChartsProps = {
  revenueByDay: RevenueByDay[];
  ordersByStatus: OrdersByStatus[];
  topProducts: TopProduct[];
  storeCurrency: string;
};

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function DashboardCharts({
  revenueByDay,
  ordersByStatus,
  topProducts,
  storeCurrency,
}: DashboardChartsProps) {
  const [expanded, setExpanded] = useState<ExpandedChart>(null);
  const hasRevenue = revenueByDay.some((d) => d.revenue > 0);
  const hasStatus = ordersByStatus.some((s) => s.count > 0);
  const hasProducts = topProducts.length > 0;

  const LARGE_HEIGHT = 420;

  const ChartCard = ({
    id,
    title,
    children,
  }: {
    id: ExpandedChart;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900 sm:text-lg">{title}</h2>
        <button
          type="button"
          onClick={() => setExpanded(id)}
          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
          title="Expand chart"
          aria-label="Expand chart"
        >
          <ExpandIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="h-[180px] w-full min-w-0">
        {children}
      </div>
    </div>
  );

  const Modal = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => setExpanded(null)}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
          <button
            type="button"
            onClick={() => setExpanded(null)}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Close"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <div style={{ height: LARGE_HEIGHT }} className="w-full">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {hasRevenue && revenueByDay.length > 0 && (
          <ChartCard id="revenue" title="Revenue (last 14 days)">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#71717a" />
                <YAxis tick={{ fontSize: 10 }} stroke="#71717a" tickFormatter={(v) => (v / 100).toFixed(0)} width={32} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value ?? 0), storeCurrency), "Revenue"]}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {hasStatus && ordersByStatus.length > 0 && (
          <ChartCard id="status" title="Orders by status">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={56}
                >
                  {ordersByStatus.map((_, index) => (
                    <Cell key={index} fill={STATUS_COLORS[_.status] ?? CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value ?? 0, "Orders"]} contentStyle={{ fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {hasProducts && (
          <ChartCard id="topProducts" title="Top products (sold)">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ top: 4, right: 16, left: 60, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={58} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [value ?? 0, "Sold"]} contentStyle={{ fontSize: "12px" }} />
                <Bar dataKey="quantity" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Qty" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {hasRevenue && revenueByDay.length > 0 && (
          <ChartCard id="ordersPerDay" title="Orders per day">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#71717a" />
                <YAxis tick={{ fontSize: 10 }} stroke="#71717a" width={24} />
                <Tooltip contentStyle={{ fontSize: "12px" }} />
                <Bar dataKey="orders" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {expanded === "revenue" && hasRevenue && revenueByDay.length > 0 && (
        <Modal title="Revenue (last 14 days)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradientExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#71717a" />
              <YAxis tick={{ fontSize: 12 }} stroke="#71717a" tickFormatter={(v) => (v / 100).toFixed(0)} />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value ?? 0), storeCurrency), "Revenue"]}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={2} fill="url(#revenueGradientExp)" />
            </AreaChart>
          </ResponsiveContainer>
        </Modal>
      )}

      {expanded === "status" && hasStatus && ordersByStatus.length > 0 && (
        <Modal title="Orders by status">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ordersByStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={120}
              >
                {ordersByStatus.map((_, index) => (
                  <Cell key={index} fill={STATUS_COLORS[_.status] ?? CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value ?? 0, "Orders"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Modal>
      )}

      {expanded === "topProducts" && hasProducts && (
        <Modal title="Top products (units sold)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical" margin={{ top: 8, right: 30, left: 100, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [value ?? 0, "Sold"]} />
              <Bar dataKey="quantity" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Quantity" />
            </BarChart>
          </ResponsiveContainer>
        </Modal>
      )}

      {expanded === "ordersPerDay" && hasRevenue && revenueByDay.length > 0 && (
        <Modal title="Orders per day (last 14 days)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#71717a" />
              <YAxis tick={{ fontSize: 12 }} stroke="#71717a" />
              <Tooltip />
              <Bar dataKey="orders" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </Modal>
      )}

      {!hasRevenue && !hasStatus && !hasProducts && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
          No order data yet. Charts will appear once you have orders.
        </div>
      )}
    </>
  );
}
