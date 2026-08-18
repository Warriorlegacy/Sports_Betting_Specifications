import React, { useState } from 'react';
import {
  Users,
  ChevronRight,
  ChevronDown,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Ban,
  UserCheck,
  Coins,
  KeyRound
} from 'lucide-react';

export interface TreeNode {
  id: string;
  username: string;
  role: string;
  parentId: string | null;
  creditLimit: number;
  availableCredit: number;
  exposure: number;
  isActive: boolean;
  depth: number;
  children: TreeNode[];
}

interface HierarchyTreeProps {
  tree: TreeNode | null;
  currentUserRole: string;
  onOpenCreditModal: (user: TreeNode, mode: 'ALLOCATE' | 'RECALL') => void;
  onOpenCreateModal: (parentUser: TreeNode) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onOpenResetPassword?: (user: TreeNode) => void;
}

export const HierarchyTree: React.FC<HierarchyTreeProps> = ({
  tree,
  currentUserRole,
  onOpenCreditModal,
  onOpenCreateModal,
  onToggleStatus,
  onOpenResetPassword
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    ...(tree ? { [tree.id]: true } : {})
  });

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'SUPER_MASTER':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'MASTER':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'AGENT':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const canCreateChild = (role: string) => {
    return role !== 'USER';
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes[node.id] ?? true;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="flex flex-col space-y-2">
        {/* Node Card */}
        <div
          className={`flex flex-wrap items-center justify-between p-4 rounded-xl transition-all border ${
            node.isActive
              ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              : 'bg-red-950/20 border-red-900/40 opacity-75'
          }`}
          style={{ marginLeft: `${Math.min(depth * 24, 120)}px` }}
        >
          {/* Node Identity */}
          <div className="flex items-center space-x-3 min-w-[260px]">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            ) : (
              <div className="w-7" />
            )}

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-slate-100">{node.username}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${getRoleColor(node.role)}`}>
                  {node.role.replace('_', ' ')}
                </span>
                {!node.isActive && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-red-900/50 text-red-300 border border-red-700/50">
                    Suspended
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 mono-num">UUID: {node.id.slice(0, 8)}...</span>
            </div>
          </div>

          {/* Balance & Risk Metrics */}
          <div className="flex items-center space-x-6 my-2 sm:my-0">
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-medium text-slate-400">Available Credit</span>
              <span className="mono-num text-sm font-bold text-emerald-400">
                {node.availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-[11px] font-medium text-slate-400">Active Exposure</span>
              <span className="mono-num text-sm font-bold text-amber-400">
                {node.exposure.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-[11px] font-medium text-slate-400">Credit Limit</span>
              <span className="mono-num text-sm font-semibold text-slate-300">
                {node.creditLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2">
            {/* Credit Allocation */}
            <button
              onClick={() => onOpenCreditModal(node, 'ALLOCATE')}
              title="Allocate Credit to this node"
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>+ Credit</span>
            </button>

            {/* Credit Recall */}
            <button
              onClick={() => onOpenCreditModal(node, 'RECALL')}
              title="Recall unencumbered credit from this node"
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30 transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>- Recall</span>
            </button>

            {/* Add Subordinate (if not User) */}
            {canCreateChild(node.role) && (
              <button
                onClick={() => onOpenCreateModal(node)}
                title="Create Downline Subordinate"
                className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Subordinate</span>
              </button>
            )}

            {/* Status Toggle */}
            <button
              onClick={() => onToggleStatus(node.id, node.isActive)}
              title={node.isActive ? 'Suspend User' : 'Activate User'}
              className={`p-1.5 rounded-lg border transition-colors ${
                node.isActive
                  ? 'text-slate-400 hover:text-red-400 border-slate-700 hover:bg-red-500/10'
                  : 'text-red-400 hover:text-emerald-400 border-red-700 hover:bg-emerald-500/10'
              }`}
            >
              {node.isActive ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </button>

            {/* Reset Password */}
            {onOpenResetPassword && (
              <button
                onClick={() => onOpenResetPassword(node)}
                title="Reset Credentials / Password"
                className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
              >
                <KeyRound className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col space-y-2 pl-4 border-l-2 border-slate-800 ml-4">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top summary bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center space-x-3">
          <Users className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-base font-bold text-slate-100">Downline Branch Navigator</h2>
            <p className="text-xs text-slate-400">Strict 5-Tier Non-Cyclic Credit & Subordinate Isolation</p>
          </div>
        </div>

        {tree && canCreateChild(tree.role) && (
          <button
            onClick={() => onOpenCreateModal(tree)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Downline Account</span>
          </button>
        )}
      </div>

      {/* Tree Visualization */}
      <div className="space-y-3">
        {tree ? renderNode(tree) : (
          <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
            No hierarchy nodes found.
          </div>
        )}
      </div>
    </div>
  );
};
