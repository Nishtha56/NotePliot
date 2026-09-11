"use client";

import React, { useState } from "react";
import { ActionItem } from "@/types";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  User,
  CheckCircle2,
  X
} from "lucide-react";
import { createActionItem, toggleActionItem, deleteActionItem, updateActionItem } from "@/lib/api";
import { useToast } from "./Toast";

interface ActionItemsProps {
  meetingId: number;
  actionItems: ActionItem[];
  onItemsChange: () => void;
}

export default function ActionItems({ meetingId, actionItems, onItemsChange }: ActionItemsProps) {
  const { showToast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleComplete = async (item: ActionItem) => {
    try {
      await toggleActionItem(item.id);
      showToast(
        item.completed ? "Marked incomplete" : "Action item completed!",
        item.title,
        "success"
      );
      onItemsChange();
    } catch (err: unknown) {
      showToast("Error updating task status", err instanceof Error ? err.message : "Unexpected task update error", "error");
    }
  };

  const handleDelete = async (item: ActionItem) => {
    try {
      await deleteActionItem(item.id);
      showToast("Action item deleted", item.title, "info");
      onItemsChange();
    } catch (err: unknown) {
      showToast("Error deleting action item", err instanceof Error ? err.message : "Unexpected delete error", "error");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await createActionItem(meetingId, {
        title: newTitle.trim(),
        assignee: newAssignee.trim() || undefined,
        due_date: newDueDate.trim() || undefined,
        description: newDescription.trim() || undefined,
        completed: false,
      });
      showToast("Action item added successfully", newTitle, "success");
      setNewTitle("");
      setNewAssignee("");
      setNewDueDate("");
      setNewDescription("");
      setShowAddForm(false);
      onItemsChange();
    } catch (err: unknown) {
      showToast("Failed to create action item", err instanceof Error ? err.message : "Unexpected create error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.title.trim()) return;

    setIsSubmitting(true);
    try {
      await updateActionItem(editingItem.id, {
        title: editingItem.title,
        assignee: editingItem.assignee || undefined,
        due_date: editingItem.due_date || undefined,
        description: editingItem.description || undefined,
      });
      showToast("Action item updated", editingItem.title, "success");
      setEditingItem(null);
      onItemsChange();
    } catch (err: unknown) {
      showToast("Failed to update action item", err instanceof Error ? err.message : "Unexpected update error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedCount = actionItems.filter((a) => a.completed).length;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      {/* Header with Stats & Add Button */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Action Items & Tasks</h3>
            <p className="text-[11px] text-slate-400">
              {completedCount} of {actionItems.length} completed
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Task
        </button>
      </div>

      {/* Inline Creation Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="p-4 mb-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3">
          <h4 className="text-xs font-bold text-purple-900">Create New Action Item</h4>
          <input
            type="text"
            placeholder="Action item title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Assignee (e.g. Sarah)"
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <input
              type="text"
              placeholder="Due Date (e.g. Aug 20)"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 disabled:opacity-50"
            >
              Save Action Item
            </button>
          </div>
        </form>
      )}

      {/* Action Items List */}
      <div className="space-y-3">
        {actionItems.length > 0 ? (
          actionItems.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                item.completed
                  ? "bg-slate-50 border-slate-200/60 text-slate-400 opacity-80"
                  : "bg-white border-slate-200 hover:border-purple-200 shadow-sm"
              }`}
            >
              {/* Checkbox & Details */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => handleToggleComplete(item)}
                  className="mt-0.5 text-purple-600 hover:text-purple-700 flex-shrink-0"
                >
                  {item.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 hover:text-purple-600" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${item.completed ? "line-through text-slate-500" : "text-slate-900"}`}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                  )}

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px]">
                    {item.assignee && (
                      <span className="flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                        <User className="w-3 h-3 text-purple-600" /> {item.assignee}
                      </span>
                    )}
                    {item.due_date && (
                      <span className="flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                        <Calendar className="w-3 h-3 text-indigo-600" /> {item.due_date}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action item edit & delete controls */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                <button
                  onClick={() => setEditingItem(item)}
                  className="p-1 text-slate-400 hover:text-purple-600 hover:bg-slate-100 rounded-md transition-colors"
                  title="Edit item"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs font-semibold text-slate-600">No action items extracted yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click &quot;Add Task&quot; above to create one</p>
          </div>
        )}
      </div>

      {/* Edit Action Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Edit Action Item</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Assignee</label>
                  <input
                    type="text"
                    value={editingItem.assignee || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, assignee: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Due Date</label>
                  <input
                    type="text"
                    value={editingItem.due_date || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, due_date: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
