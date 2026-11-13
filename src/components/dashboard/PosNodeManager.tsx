"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  ExternalLink,
  Laptop,
  Users,
} from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import {
  getStorePosNodes,
  createStorePosNode,
  type PosNodeInfo,
} from "@/lib/firestore-service";

export const PosNodeManager: React.FC = () => {
  const [nodes, setNodes] = useState<PosNodeInfo[]>([]);
  const [showPinMap, setShowPinMap] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);

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

  const togglePinVisibility = (id: string) => {
    setShowPinMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newStaff.trim()) return;

    createStorePosNode({
      name: newName.trim(),
      branch: newBranch,
      staffName: newStaff.trim(),
      pin: newPin || "1234",
      status: newStatus,
    });

    setNewName("");
    setNewStaff("");
    setShowAddModal(false);
  };

  return (
    <section className="carbon-card p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
      {/* ─── Header & Primary POS Action Buttons ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
              <Laptop className="w-3 h-3" /> POS Terminal Nodes
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] font-ui">
              {activeNodesCount} Active · {nodes.length} Configured Terminals
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Staff POS Cashier Terminals & Revenue Split
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Manage physical in-store cashier registers, assigned staff members, PIN credentials, and simulated live sales.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Add POS Node</span>
          </button>

          <Link
            href={APP_ROUTES.cashier}
            target="_blank"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center gap-2"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Launch Cashier POS</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </Link>
        </div>
      </div>

      {/* ─── Revenue Split: POS In-Store vs Online Storefront ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total In-Store POS Revenue */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              POS In-Store Sales (Today)
            </span>
            <Banknote className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white">
              {totalPosRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-white/50">EGP</span>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center ml-auto">
              <ArrowUpRight className="w-3 h-3" /> {totalPosOrders} orders
            </span>
          </div>
          <div className="mt-3 text-[10px] text-white/40 flex justify-between">
            <span>Avg Ticket: {totalPosOrders > 0 ? Math.round(totalPosRevenue / totalPosOrders) : 0} EGP</span>
            <span className="text-emerald-400 font-bold">42% of Daily GMV</span>
          </div>
        </div>

        {/* Online Storefront Revenue */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Online FastCart Sales (Today)
            </span>
            <CreditCard className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white">
              46,850
            </span>
            <span className="text-xs text-white/50">EGP</span>
            <span className="text-[10px] font-bold text-blue-400 flex items-center ml-auto">
              <ArrowUpRight className="w-3 h-3" /> 38 orders
            </span>
          </div>
          <div className="mt-3 text-[10px] text-white/40 flex justify-between">
            <span>Online Conv: 3.8%</span>
            <span className="text-blue-400 font-bold">58% of Daily GMV</span>
          </div>
        </div>

        {/* POS Payment Methods Distribution */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              In-Store Tender Mix
            </span>
            <QrCode className="w-4 h-4 text-purple-400" />
          </div>
          <div className="space-y-1.5 text-[10px]">
            <div>
              <div className="flex justify-between text-white/60 mb-0.5">
                <span>Cash Register</span>
                <span className="font-bold text-white">52%</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[52%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-white/60 mb-0.5">
                <span>Mada / Meeza / QR</span>
                <span className="font-bold text-white">34%</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[34%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-white/60 mb-0.5">
                <span>Visa / MasterCard</span>
                <span className="font-bold text-white">14%</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[14%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── POS Cashier Nodes Roster Table ─── */}
      <div className="overflow-x-auto border border-white/5 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] font-bold text-white/40 uppercase tracking-wider">
              <th className="p-3.5">Terminal Node</th>
              <th className="p-3.5">Branch Location</th>
              <th className="p-3.5">Assigned Staff</th>
              <th className="p-3.5">Quick PIN</th>
              <th className="p-3.5">Shift Status</th>
              <th className="p-3.5">Today Sales</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {nodes.map((node) => {
              const isPinVisible = showPinMap[node.id];
              return (
                <tr
                  key={node.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shrink-0 font-bold text-[10px]">
                        {node.id.replace("TERM-", "#")}
                      </div>
                      <div>
                        <p className="font-bold text-white leading-tight">{node.name}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">{node.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 text-white/70">{node.branch}</td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-[9px] font-black text-white flex items-center justify-center">
                        {node.staffName.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{node.staffName}</span>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                      <span>{isPinVisible ? node.pin : "••••"}</span>
                      <button
                        onClick={() => togglePinVisibility(node.id)}
                        className="text-white/30 hover:text-white transition-colors"
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
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        node.status === "Active"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : node.status === "Break"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : "bg-white/5 text-white/40 border border-white/10"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          node.status === "Active"
                            ? "bg-emerald-400 animate-pulse"
                            : node.status === "Break"
                            ? "bg-amber-400"
                            : "bg-white/40"
                        }`}
                      />
                      <span>{node.status}</span>
                    </span>
                  </td>

                  <td className="p-3.5">
                    <p className="font-bold text-white">
                      {node.todaySales.toLocaleString()} EGP
                    </p>
                    <p className="text-[10px] text-white/40">{node.todayOrders} receipts</p>
                  </td>

                  <td className="p-3.5 text-right">
                    <Link
                      href={APP_ROUTES.cashier}
                      target="_blank"
                      className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ArrowUpRight className="w-3 h-3 text-blue-400" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── MODAL: PROVISION NEW POS NODE ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-blue-400" />
                  <span>Provision New POS Node</span>
                </h4>
                <p className="text-xs text-white/50 mt-0.5">
                  Creates an in-store cashier terminal tied to your store inventory.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="space-y-3.5 text-xs">
              <div>
                <label className="text-white/60 block mb-1">Terminal Register Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Counter 3 / Mobile Tablet 01"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1">Branch / Store Location</label>
                <select
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Cairo Heliopolis Flagship" className="bg-neutral-900">
                    Cairo Heliopolis Flagship
                  </option>
                  <option value="New Cairo Branch" className="bg-neutral-900">
                    New Cairo 5th Settlement
                  </option>
                  <option value="Alexandria Depot" className="bg-neutral-900">
                    Alexandria Depot & Showroom
                  </option>
                </select>
              </div>

              <div>
                <label className="text-white/60 block mb-1">Assigned Cashier / Staff Name</label>
                <input
                  type="text"
                  required
                  value={newStaff}
                  onChange={(e) => setNewStaff(e.target.value)}
                  placeholder="e.g. Mahmoud Ezzat"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">4-Digit Login PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="1234"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Initial Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Active" className="bg-neutral-900">Active</option>
                    <option value="Offline" className="bg-neutral-900">Offline</option>
                    <option value="Break" className="bg-neutral-900">On Break</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0479E8] to-[#0083FE] text-white font-bold shadow-md shadow-blue-500/20"
                >
                  Save & Activate Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
