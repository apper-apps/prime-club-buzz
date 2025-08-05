import { motion } from 'framer-motion'
import { Draggable } from '@hello-pangea/dnd'
import React from 'react'
import ApperIcon from '@/components/ApperIcon'
import Badge from '@/components/atoms/Badge'
import Avatar from '@/components/atoms/Avatar'
import Card from '@/components/atoms/Card'
import { cardAnimations } from '@/utils/animations'

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getStageColor(stage) {
  const colors = {
    'Connected': 'default',
    'Locked': 'info',
    'Meeting Booked': 'warning',
    'Meeting Done': 'primary',
    'Negotiation': 'warning',
    'Closed': 'success',
    'Lost': 'error'
  }
  return colors[stage] || 'default'
}

function DealCard({ deal, index, onEdit }) {
  // Ensure unique draggable ID with fallback
  const draggableId = deal?.id || `deal-${index}-${Date.now()}`
  
  // Validate deal object to prevent rendering errors
  if (!deal) {
    return null
  }

  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => (
<motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          {...cardAnimations.listItem(index)}
          whileHover={cardAnimations.hover}
          whileTap={cardAnimations.tap}
          className={`mb-3 ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {deal.title || 'Untitled Deal'}
                  </h3>
{deal.edition && deal.edition !== "Select Edition" && (
                  <Badge variant="primary" size="sm" className="text-xs">
                    {deal.edition}
                  </Badge>
                )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(deal);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Edit deal"
                >
                  <ApperIcon name="MoreHorizontal" size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(deal.value)}
              </span>
              {!["Connected", "Locked", "Meeting Done"].includes(deal.stage) && (
                <Badge variant={getStageColor(deal.stage)} size="sm">
                  {deal.stage}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar name={deal.assignedRep} size="sm" />
                <span className="ml-2 text-sm text-gray-600">{deal.assignedRep}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <ApperIcon name="Calendar" size={12} className="mr-1" />
                <span>{new Date(deal.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </Draggable>
  );
};

export default DealCard;