import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import salesRepsData from "@/services/mockData/salesReps.json";
import dashboardData from "@/services/mockData/dashboard.json";
import dealsData from "@/services/mockData/deals.json";
import leadsData from "@/services/mockData/leads.json";
import contactsData from "@/services/mockData/contacts.json";
import { getDeals, updateDeal } from "@/services/api/dealsService";
import ApperIcon from "@/components/ApperIcon";
import DealEditModal from "@/components/molecules/DealEditModal";
import DealCard from "@/components/molecules/DealCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const Pipeline = () => {
const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const stages = [
    { id: "Connected", name: "Connected", color: "bg-blue-500" },
    { id: "Locked", name: "Locked", color: "bg-purple-500" },
    { id: "Meeting Booked", name: "Meeting Booked", color: "bg-yellow-500" },
    { id: "Meeting Done", name: "Meeting Done", color: "bg-orange-500" },
    { id: "Negotiation", name: "Negotiation", color: "bg-red-500" },
    { id: "Closed", name: "Closed", color: "bg-green-500" },
    { id: "Lost", name: "Lost", color: "bg-gray-500" }
  ];

const loadDeals = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await getDeals();
      console.log('Pipeline received data:', data, 'Type:', typeof data, 'IsArray:', Array.isArray(data));
      
      // Multiple layers of defensive checking
      let dealsArray = [];
      
      if (Array.isArray(data)) {
        dealsArray = data;
      } else if (data && typeof data === 'object') {
        // Try to extract array from object
        if (Array.isArray(data.deals)) {
          dealsArray = data.deals;
        } else if (Array.isArray(data.data)) {
          dealsArray = data.data;
        } else if (Array.isArray(data.items)) {
          dealsArray = data.items;
        } else {
          console.warn('Unexpected data structure from getDeals:', data);
          dealsArray = [];
        }
      } else {
        console.warn('getDeals returned non-object, non-array data:', data);
        dealsArray = [];
      }
      
// Validate each deal object
      const validDeals = dealsArray.filter(deal => 
        deal && 
        typeof deal === 'object' && 
        deal.Id !== undefined
      );
      
      console.log('Setting deals:', validDeals.length, 'valid deals out of', dealsArray.length);
      setDeals(validDeals);
      
    } catch (err) {
      console.error("Failed to load deals:", err);
      setError("Failed to load deals. Please try again.");
      setDeals([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const dealId = parseInt(draggableId);
    const newStage = destination.droppableId;

    try {
      await updateDeal(dealId, { stage: newStage });
      
const updatedDeals = deals.map(deal =>
        deal.Id === dealId ? { ...deal, stage: newStage } : deal
      );
      setDeals(updatedDeals);
      
      toast.success(`Deal moved to ${newStage}`);
    } catch (err) {
      toast.error("Failed to update deal stage");
    }
};

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setShowEditModal(true);
  };

  const handleSaveDeal = async (dealId, updatedData) => {
    const updatedDeal = await updateDeal(dealId, updatedData);
    
const updatedDeals = deals.map(deal =>
      deal.Id === dealId ? { ...deal, ...updatedData } : deal
    );
    setDeals(updatedDeals);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingDeal(null);
  };

const getDealsForStage = (stage) => {
    // Multi-layer defensive checks
    if (!Array.isArray(deals)) {
      console.error("Deals is not an array in getDealsForStage:", typeof deals, deals);
      return [];
    }
    
    if (deals.length === 0) {
      return [];
    }
    
    try {
      return deals.filter(deal => {
        if (!deal || typeof deal !== 'object') {
          console.warn('Invalid deal object:', deal);
          return false;
        }
        return deal.stage === stage;
      });
    } catch (error) {
      console.error('Error filtering deals for stage:', stage, error);
      return [];
    }
  };
  
  const getTotalValue = (stage) => {
    const stageDeals = getDealsForStage(stage);
    return stageDeals.reduce((sum, deal) => sum + (deal?.value || 0), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) return <Loading type="kanban" />;
  if (error) return <Error message={error} onRetry={loadDeals} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deal Pipeline</h1>
          <p className="text-gray-600 mt-1">Track and manage your sales opportunities</p>
        </div>
        <Button>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Deal
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageDeals = getDealsForStage(stage.id);
            const totalValue = getTotalValue(stage.id);

            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <Card className="h-full">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${stage.color} mr-2`} />
                        <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                      </div>
                      <Badge variant="default" size="sm">
                        {stageDeals.length}
                      </Badge>
                    </div>
                    {totalValue > 0 && (
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(totalValue)}
                      </p>
                    )}
                  </div>

                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-4 min-h-[400px] transition-colors ${
                          snapshot.isDraggingOver ? "bg-primary-50" : ""
                        }`}
                      >
{stageDeals.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                            <ApperIcon name="Package" size={32} className="mb-2" />
                            <p className="text-sm">No deals in this stage</p>
                          </div>
                        ) : (
stageDeals.map((deal, index) => (
                            <DealCard
                              key={deal.Id || index}
                              deal={deal}
                              index={index}
                              onEdit={handleEditDeal}
                            />
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Card>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Edit Deal Modal */}
{showEditModal && editingDeal && (
        <DealEditModal
          isOpen={showEditModal}
          deal={editingDeal}
          onSave={handleSaveDeal}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
};

export default Pipeline;