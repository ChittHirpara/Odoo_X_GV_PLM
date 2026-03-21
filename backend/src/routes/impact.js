const express = require('express');
const ECO = require('../models/ECO');
const BOM = require('../models/BOM');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// GET /api/ecos/:id/impact
router.get('/:id/impact', authMiddleware, roleMiddleware(['Admin', 'Approver']), async (req, res) => {
  try {
    const eco = await ECO.findOne({ _id: req.params.id });
    if (!eco) {
      return res.status(404).json({ success: false, message: 'ECO not found' });
    }

    let bom = null;
    if (eco.bomId) {
      bom = await BOM.findOne({ _id: eco.bomId });
    }

    const changes = eco.changes || [];
    let totalCostImpactPerUnit = 0;
    
    // Process component changes
    const changedComponents = [];
    
    for (const change of changes) {
      const type = change.changeType || change.type;
      const field = change.field || change.fieldName || '';
      
      // Look for Component or Cost related changes
      if (field.startsWith('Component:') || field.toLowerCase().includes('material') || field.toLowerCase().includes('price')) {
        let costDiff = 0;
        
        // Very basic mock cost calculation based on text parsing for the hackathon
        // In a real app, this would deeply query the ERP component pricing DB.
        const parseQuantity = (str) => {
          if (!str) return 0;
          const match = str.match(/qty:\s*(\d+)/i);
          return match ? parseInt(match[1], 10) : 1;
        };
        
        // Fallback fake costs
        const fakeCostMap = {
          'ESP32': 5.50,
          'Antenna': 1.20,
          'LM7805': 0.85,
          'Kalrez': 45.00,
          'Viton': 12.00,
          'Relief Valve': 18.50,
          'Spring': 2.50,
          'Needle Bearings': 8.00,
          'Angular Contact': 14.00
        };
        
        const getCostForName = (name) => {
          if (!name || name === '—') return 0;
          for (let [key, val] of Object.entries(fakeCostMap)) {
            if (name.includes(key) || field.includes(key)) return val;
          }
          if (field.toLowerCase().includes('price') || name.includes('$') || name.includes('₹')) {
             const dollars = name.match(/[\$₹]?([0-9,.]+)/);
             if (dollars) return parseFloat(dollars[1].replace(/,/g, ''));
          }
          return 10.00; // default generic part cost
        };

        const oldQty = parseQuantity(change.oldValue);
        const newQty = parseQuantity(change.newValue);
        const oldC = getCostForName(change.oldValue);
        const newC = getCostForName(change.newValue);

        if (type === 'added') {
          costDiff = newC * newQty;
        } else if (type === 'removed') {
          costDiff = -(oldC * oldQty);
        } else if (type === 'modified') {
          // If cost changed directly (e.g. price change)
          if (field.toLowerCase().includes('price')) {
             costDiff = newC - oldC;
          } else {
             costDiff = (newC * (newQty || 1)) - (oldC * (oldQty || 1));
          }
        }
        
        totalCostImpactPerUnit += costDiff;

        changedComponents.push({
          name: field.replace('Component: ', ''),
          oldValue: change.oldValue || '—',
          newValue: change.newValue || '—',
          costDiff: parseFloat(costDiff.toFixed(2)),
          changeType: type
        });
      }
    }

    // Step 3: Find active Orders (simulated)
    const activeOrdersCount = await ECO.countDocuments({
      stage: { $in: ['New', 'In Review', 'Approval'] },
      productId: eco.productId
    });
    
    // ensure at least 1 for math logic
    const activeOrders = Math.max(1, activeOrdersCount * 3); 
    const unitsPerOrder = 100;
    const totalUnitsAffected = activeOrders * unitsPerOrder;
    const totalCostImpact = totalCostImpactPerUnit * totalUnitsAffected;

    // Step 4: Time impact
    // We'll calculate a mock time impact based on component additions/removals
    let timeImpactPerUnit = 0;
    changedComponents.forEach(c => {
       if (c.changeType === 'added') timeImpactPerUnit += 5; // +5 mins per new component
       if (c.changeType === 'removed') timeImpactPerUnit -= 3; // -3 mins
    });
    
    const totalTimeImpactMinutes = timeImpactPerUnit * totalUnitsAffected;
    const totalTimeImpactHours = totalTimeImpactMinutes / 60;

    // Generate Risk
    const absoluteCost = Math.abs(totalCostImpact);
    let riskLevel = 'LOW';
    let recommendation = 'Low risk change — safe to approve';
    
    if (absoluteCost > 100000) {
      riskLevel = 'HIGH';
      recommendation = 'High financial impact — consider phased rollout';
    } else if (absoluteCost > 10000) {
      riskLevel = 'MEDIUM';
      recommendation = 'Moderate impact — review carefully before approving';
    } else if (timeImpactPerUnit > 10) {
      riskLevel = 'MEDIUM';
      recommendation = 'Moderate operational impact — assembly time increases significantly';
    }

    const directionFromInt = (val) => val > 0 ? 'increase' : val < 0 ? 'decrease' : 'neutral';

    res.json({
      success: true,
      data: {
        costImpact: {
          perUnit: parseFloat(totalCostImpactPerUnit.toFixed(2)),
          total: parseFloat(totalCostImpact.toFixed(2)),
          direction: directionFromInt(totalCostImpactPerUnit),
          percentage: 0 // Mocking percent for now
        },
        timeImpact: {
          perUnit: timeImpactPerUnit,
          total: parseFloat(totalTimeImpactHours.toFixed(1)),
          direction: directionFromInt(timeImpactPerUnit)
        },
        affectedOrders: {
          count: activeOrders,
          totalUnits: totalUnitsAffected
        },
        changedComponents,
        riskLevel,
        recommendation
      }
    });

  } catch (error) {
    console.error('Impact prediction error:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate ECO impact', error: error.toString() });
  }
});

module.exports = router;
