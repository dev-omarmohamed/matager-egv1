"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  Plus,
  ArrowUpRight,
  CreditCard,
  Banknote,
  QrCode,
  Eye,
  EyeOff,
  ExternalLink,
  Laptop,
  X,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import {
  getStorePosNodes,
  createStorePosNode,
  type PosNodeInfo,
} from "@/lib/firestore-service";

const MAX_POS_NODES = 5; // Maximum allowed nodes

export const PosNodeManager: React.FC = () => {
  const [nodes, setNodes] = useState<PosNodeInfo[]>([]);
  const [showPinMap, setShowPinMap] = useState<Record<string, boolean>>({});

  // Toggle for the inline form instead of a modal
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state for new node
  const [newName, setNewName] = useState("");
  const [newBranch, setNewBranch] = useState("Cairo Heliopolis Flagship");
  const [newStaff, setNewStaff] = useState("");
  const [newPin, setNewPin] = useState("1234");
  const [newStatus, setNewStatus] = useState<"Active" | "Offline" | "Break">("Active");

  // Load and subscribe to POS updates
  useEffect(() => {
    const refreshNodes = () => {
      setNodes(getStorePosNodes());
    };
    refreshNodes();

    const handlePosSale = (e: any) => {
      const sale = e.detail;
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === sale.terminal_id) {
            return {
              ...node,
              todaySales: node.todaySales + (sale.amount || 0),
              todayOrders: node.todayOrders + 1,
              lastActive: "Just now",
            };
          }
          return node;
        })
      );
    };

    const handleNodesUpdated = () => {
      refreshNodes();
    };

    window.addEventListener("matager:pos_sale", handlePosSale);
    window.addEventListener("matager:pos_nodes_updated", handleNodesUpdated);

    return () => {
      window.removeEventListener("matager:pos_sale", handlePosSale);
      window.removeEventListener("matager:pos_nodes_updated", handleNodesUpdated);
    };
  }, []);

  // Aggregated POS Metrics
  const totalPosRevenue = nodes.reduce((acc, n) => acc + n.todaySales, 0);
  const totalPosOrders = nodes.reduce((acc, n) => acc + n.todayOrders, 0);
  const activeNodesCount = nodes.filter((n) => n.status === "Active").length;
  const isMaxNodesReached = nodes.length >= MAX_POS_NODES;

  const togglePinVisibility = (id: string) => {
    setShowPinMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newStaff.trim() || isMaxNodesReached) return;

    createStorePosNode({
      name: newName.trim(),
      branch: newBranch,
      staffName: newStaff.trim(),
      pin: newPin || "1234",
      status: newStatus,
    });

    setNewName("");
    setNewStaff("");
    setShowAddForm(false); // Close inline form on success
  };

  return (
    <section className="carbon-card p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)] space-y-6 transition-all duration-300">

      {/* ─── Header & Primary POS Action Buttons ─── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="w-full lg:w-auto">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30 flex items-center gap-1">
              <Laptop className="w-3 h-3" /> POS Terminal Nodes
            </span>
            <span className="text-[10px] text-slate-500 dark:text-[var(--color-text-muted)] font-ui">
              {activeNodesCount} Active · {nodes.length} / {MAX_POS_NODES} Configured
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Staff POS Cashier Terminals & Revenue Split
          </h3>
          <p className="text-xs text-slate-500 dark:text-[var(--color-text-secondary)] mt-1 max-w-2xl">
            Manage physical in-store cashier registers, assigned staff members, PIN credentials, and simulated live sales.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={isMaxNodesReached && !showAddForm}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5
              ${isMaxNodesReached && !showAddForm
                ? "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 cursor-not-allowed"
                : "bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white"
              }
            `}
          >
            {showAddForm ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
                <span>Close Form</span>
              </>
            ) : (
              <>
                <Plus className={`w-3.5 h-3.5 ${isMaxNodesReached ? "text-slate-400" : "text-blue-500"}`} />
                <span>{isMaxNodesReached ? "Max Nodes Reached" : "Add POS Node"}</span>
              </>
            )}
          </button>

          <Link
            href={APP_ROUTES.cashier}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Launch Cashier POS</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </Link>
        </div>
      </div>

      {/* ─── INLINE FORM: PROVISION NEW POS NODE ─── */}
      {showAddForm && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-200 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl p-4 sm:p-5 shadow-inner">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-3 mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-blue-500" />
                <span>Provision New POS Node</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-white/50 mt-0.5">
                Creates an in-store cashier terminal tied to your store inventory.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-white/40 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateNode} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-600 dark:text-white/60 block mb-1.5 font-medium">Terminal Register Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Counter 3 / Mobile Tablet 01"
                  className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-white/60 block mb-1.5 font-medium">Branch / Store Location</label>
                <select
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                  className="w-full bg-white dark:bg-[#0a0a0a] border border-slate-300 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                >
                  <option value="Cairo Heliopolis Flagship">Cairo Heliopolis Flagship</option>
                  <option value="New Cairo Branch">New Cairo 5th Settlement</option>
                  <option value="Alexandria Depot">Alexandria Depot & Showroom</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 dark:text-white/60 block mb-1.5 font-medium">Assigned Cashier / Staff Name</label>
                <input
                  type="text"
                  required
                  value={newStaff}
                  onChange={(e) => setNewStaff(e.target.value)}
                  placeholder="e.g. Mahmoud Ezzat"
                  className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-white/60 block mb-1.5 font-medium">4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="1234"
                    className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-white/60 block mb-1.5 font-medium">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-white dark:bg-[#0a0a0a] border border-slate-300 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Offline">Offline</option>
                    <option value="Break">On Break</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white/70 font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#0479E8] to-[#0083FE] text-white font-bold shadow-md shadow-blue-500/20 hover:brightness-110 transition-all"
              >
                Save & Activate Node
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Revenue Split: POS In-Store vs Online Storefront ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total In-Store POS Revenue */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 dark:text-[var(--color-text-muted)] uppercase tracking-wider">
              POS In-Store Sales (Today)
            </span>
            <Banknote className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex flex-wrap items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalPosRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-white/50">EGP</span>
            <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 flex items-center ml-auto">
              <ArrowUpRight className="w-3 h-3" /> {totalPosOrders} orders
            </span>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 dark:text-white/40 flex justify-between">
            <span>Avg Ticket: {totalPosOrders > 0 ? Math.round(totalPosRevenue / totalPosOrders) : 0} EGP</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">42% of Daily GMV</span>
          </div>
        </div>

        {/* Online Storefront Revenue */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 dark:text-[var(--color-text-muted)] uppercase tracking-wider">
              Online FastCart Sales (Today)
            </span>
            <CreditCard className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex flex-wrap items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              46,850
            </span>
            <span className="text-xs text-slate-500 dark:text-white/50">EGP</span>
            <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 flex items-center ml-auto">
              <ArrowUpRight className="w-3 h-3" /> 38 orders
            </span>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 dark:text-white/40 flex justify-between">
            <span>Online Conv: 3.8%</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">58% of Daily GMV</span>
          </div>
        </div>

        {/* POS Payment Methods Distribution */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold text-slate-500 dark:text-[var(--color-text-muted)] uppercase tracking-wider">
              In-Store Tender Mix
            </span>
            <QrCode className="w-4 h-4 text-purple-500" />
          </div>
          <div className="space-y-2 text-[10px]">
            <div>
              <div className="flex justify-between text-slate-600 dark:text-white/60 mb-1">
                <span>Cash Register</span>
                <span className="font-bold text-slate-900 dark:text-white">52%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[52%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-600 dark:text-white/60 mb-1">
                <span>Mada / Meeza / QR</span>
                <span className="font-bold text-slate-900 dark:text-white">34%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[34%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-600 dark:text-white/60 mb-1">
                <span>Visa / MasterCard</span>
                <span className="font-bold text-slate-900 dark:text-white">14%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[14%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── POS Cashier Nodes Roster Table ─── */}
      <div className="overflow-hidden border border-slate-200 dark:border-white/5 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01] text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">
                <th className="p-3.5 whitespace-nowrap">Terminal Node</th>
                <th className="p-3.5 whitespace-nowrap">Branch Location</th>
                <th className="p-3.5 whitespace-nowrap">Assigned Staff</th>
                <th className="p-3.5 whitespace-nowrap">Quick PIN</th>
                <th className="p-3.5 whitespace-nowrap">Shift Status</th>
                <th className="p-3.5 whitespace-nowrap">Today Sales</th>
                <th className="p-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {nodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-white/40">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 text-slate-400 dark:text-white/20" />
                      <p>No POS nodes configured yet. Click "Add POS Node" to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                nodes.map((node) => {
                  const isPinVisible = showPinMap[node.id];
                  return (
                    <tr
                      key={node.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 font-bold text-[10px]">
                            {node.id.replace("TERM-", "#")}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">{node.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-white/40 mt-0.5">{node.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-700 dark:text-white/70">{node.branch}</td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-[9px] font-black text-white flex items-center justify-center">
                            {node.staffName.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{node.staffName}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-white/70">
                          <span>{isPinVisible ? node.pin : "••••"}</span>
                          <button
                            onClick={() => togglePinVisibility(node.id)}
                            className="text-slate-400 hover:text-slate-900 dark:text-white/30 dark:hover:text-white transition-colors"
                            title={isPinVisible ? "Hide PIN" : "Show PIN"}
                          >
                            {isPinVisible ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${node.status === "Active"
                            ? "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30"
                            : node.status === "Break"
                              ? "bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30"
                              : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${node.status === "Active"
                              ? "bg-emerald-500 dark:bg-emerald-400 animate-pulse"
                              : node.status === "Break"
                                ? "bg-amber-500 dark:bg-amber-400"
                                : "bg-slate-400 dark:bg-white/40"
                              }`}
                          />
                          <span>{node.status}</span>
                        </span>
                      </td>

                      <td className="p-3.5">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {node.todaySales.toLocaleString()} EGP
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-white/40">{node.todayOrders} receipts</p>
                      </td>

                      <td className="p-3.5 text-right">
                        <Link
                          href={APP_ROUTES.cashier}
                          target="_blank"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 dark:hover:text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ArrowUpRight className="w-3 h-3 text-blue-500" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};