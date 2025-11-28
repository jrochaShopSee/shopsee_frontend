import React, { useState, useEffect } from "react";
import { EcommerceOrder, OrderStatus } from "@/app/types/ecommerce";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { Settings, MessageCircle, Truck, Plus, Send, AlertCircle, Package, Clock } from "lucide-react";
import { ecommerceApi } from "@/app/services/ecommerceApi";

interface OrderActionsProps {
    order: EcommerceOrder;
    onStatusUpdate: (newStatus: string) => void;
    onAddNote: (note: string, isCustomerNote: boolean) => void;
    onUpdateTracking: (trackingNumber: string, shippingMethod: string) => void;
}

// Mock order notes type - will be replaced with actual API type
interface OrderNote {
    id: number;
    content: string;
    isCustomerNote: boolean;
    dateAdded: string;
    addedBy: string;
}

export const OrderActions: React.FC<OrderActionsProps> = ({ order, onStatusUpdate, onAddNote, onUpdateTracking }) => {
    const [selectedStatus, setSelectedStatus] = useState(order.orderStatus);
    const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
    const [notes, setNotes] = useState<OrderNote[]>([]);
    const [newNote, setNewNote] = useState("");
    const [isCustomerNote, setIsCustomerNote] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
    const [shippingMethod, setShippingMethod] = useState("");
    const [loading, setLoading] = useState({
        status: false,
        note: false,
        tracking: false,
        notes: false,
    });

    // Load order statuses and notes on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const statuses = await ecommerceApi.getOrderStatuses();
                setOrderStatuses(statuses);

                // Load order notes (placeholder - implement API endpoint)
                setLoading((prev) => ({ ...prev, notes: true }));
                // const orderNotes = await ecommerceApi.getOrderNotes(order.id);
                // setNotes(orderNotes);

                // Mock notes for now
                setTimeout(() => {
                    setNotes([
                        {
                            id: 1,
                            content: "Order placed successfully. Payment confirmed.",
                            isCustomerNote: false,
                            dateAdded: "2024-01-15T10:30:00Z",
                            addedBy: "System",
                        },
                        {
                            id: 2,
                            content: "Customer requested expedited shipping.",
                            isCustomerNote: true,
                            dateAdded: "2024-01-15T11:15:00Z",
                            addedBy: "Admin",
                        },
                    ]);
                    setLoading((prev) => ({ ...prev, notes: false }));
                }, 1000);
            } catch (error) {
                console.error("Error loading order data:", error);
                setLoading((prev) => ({ ...prev, notes: false }));
            }
        };

        loadData();
    }, [order.id]);

    const handleStatusUpdate = async () => {
        if (selectedStatus === order.orderStatus) return;

        setLoading((prev) => ({ ...prev, status: true }));
        try {
            await onStatusUpdate(selectedStatus);
        } finally {
            setLoading((prev) => ({ ...prev, status: false }));
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        setLoading((prev) => ({ ...prev, note: true }));
        try {
            await onAddNote(newNote.trim(), isCustomerNote);
            setNewNote("");
            setIsCustomerNote(false);
        } finally {
            setLoading((prev) => ({ ...prev, note: false }));
        }
    };

    const handleUpdateTracking = async () => {
        if (!trackingNumber.trim()) return;

        setLoading((prev) => ({ ...prev, tracking: true }));
        try {
            await onUpdateTracking(trackingNumber.trim(), shippingMethod);
        } finally {
            setLoading((prev) => ({ ...prev, tracking: false }));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Status Update */}
            <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <Settings className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Update Status</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            {orderStatuses.map((status) => (
                                <option key={status.id} value={status.statusName}>
                                    {status.statusName}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <Button onClick={handleStatusUpdate} disabled={selectedStatus === order.orderStatus || loading.status} className="w-full">
                        {loading.status ? "Updating..." : "Update Status"}
                    </Button>
                </div>
            </Card>

            {/* Order Notes */}
            <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Order Notes</h3>
                </div>

                {/* Existing Notes */}
                <div className="mb-4 max-h-64 overflow-y-auto">
                    {loading.notes ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">Loading notes...</p>
                        </div>
                    ) : notes.length > 0 ? (
                        <div className="space-y-3">
                            {notes.map((note) => (
                                <div key={note.id} className={`p-3 rounded-lg border-l-4 ${note.isCustomerNote ? "bg-blue-50 border-l-blue-400" : "bg-gray-50 border-l-gray-400"}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-xs font-medium ${note.isCustomerNote ? "text-blue-600" : "text-gray-600"}`}>{note.isCustomerNote ? "Customer Note" : "Internal Note"}</span>
                                        <span className="text-xs text-gray-500">{formatDate(note.dateAdded)}</span>
                                    </div>
                                    <p className="text-sm text-gray-800">{note.content}</p>
                                    <p className="text-xs text-gray-500 mt-1">by {note.addedBy}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No notes yet</p>
                        </div>
                    )}
                </div>

                {/* Add New Note */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Add Note</label>
                        <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Enter note content..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" rows={3} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <label className="flex items-center">
                            <input type="checkbox" checked={isCustomerNote} onChange={(e) => setIsCustomerNote(e.target.checked)} className="mr-2" />
                            <span className="text-sm text-gray-700">Customer note</span>
                        </label>
                    </div>

                    <Button onClick={handleAddNote} disabled={!newNote.trim() || loading.note} size="sm" className="w-full flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>{loading.note ? "Adding..." : "Add Note"}</span>
                    </Button>
                </div>
            </Card>

            {/* Tracking Information */}
            <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <Truck className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Tracking</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                        <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking number..." className="w-full" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Method</label>
                        <Input value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)} placeholder="e.g., UPS Ground, FedEx Express..." className="w-full" />
                    </div>

                    <Button onClick={handleUpdateTracking} disabled={!trackingNumber.trim() || loading.tracking} className="w-full flex items-center space-x-2">
                        <Package className="w-4 h-4" />
                        <span>{loading.tracking ? "Updating..." : "Update Tracking"}</span>
                    </Button>
                </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>

                <div className="space-y-3">
                    <Button variant="outline" className="w-full flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>Send Order Confirmation</span>
                    </Button>

                    <Button variant="outline" className="w-full flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Mark as Priority</span>
                    </Button>

                    <Button variant="outline" className="w-full flex items-center space-x-2">
                        <Package className="w-4 h-4" />
                        <span>Create Shipment</span>
                    </Button>
                </div>
            </Card>
        </div>
    );
};
