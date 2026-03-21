const ECO = require('../models/ECO');
const Product = require('../models/Product');
const BOM = require('../models/BOM');
const { createNotification } = require('./notificationService');
const User = require('../models/User');

/**
 * Generate the next ECO number in format ECO-YYYY-NNN
 */
const generateEcoNumber = async () => {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `ECO-${currentYear}-`;

  // Count existing ECOs for this year
  const count = await ECO.countDocuments({
    ecoNumber: { $regex: `^${yearPrefix}` }
  });

  const nextNumber = (count + 1).toString().padStart(3, '0');
  return `${yearPrefix}${nextNumber}`;
};

/**
 * Apply an approved ECO — the core business logic.
 * Called when an ECO stage advances to 'Done'.
 *
 * 1. Generate ECO number
 * 2. Version bump (if versionUpdate is true)
 * 3. Archive old version & create new active version
 * 4. Add to version history
 * 5. Write approval log
 * 6. Create notifications
 */
const applyECO = async (ecoId, userId) => {
  try {
    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // 1. Generate ECO number if not already set
    if (!eco.ecoNumber) {
      eco.ecoNumber = await generateEcoNumber();
    }

    // Get the associated product
    const product = await Product.findById(eco.productId);
    if (!product) throw new Error('Associated product not found');

    // 2 & 3. Version bump and archive if versionUpdate is true
    if (eco.versionUpdate) {
      // Parse current version number
      const currentVersionNum = parseInt(product.version.replace('v', ''), 10) || 1;
      const newVersionNum = currentVersionNum + 1;
      const newVersionStr = eco.newVersion || `v${newVersionNum}`;

      // Apply changes from ECO to product fields
      if (eco.type === 'Product') {
        // Apply field-level changes
        for (const change of eco.changes) {
          if (change.changeType === 'modified' || change.changeType === 'added') {
            const fieldName = change.fieldName.toLowerCase();
            if (product.schema.paths[fieldName]) {
              product[fieldName] = change.newValue;
            }
          }
        }

        // Update product version
        product.version = newVersionStr;

        // 4. Add to version history
        product.versions.push({
          version: newVersionStr,
          date: new Date(),
          changedBy: user.name,
          ecoId: eco._id.toString(),
          summary: eco.title
        });

        await product.save();
      }

      if (eco.type === 'BoM' && eco.bomId) {
        const bom = await BOM.findById(eco.bomId);
        if (bom) {
          // Apply component changes
          for (const change of eco.changes) {
            if (change.fieldName && change.fieldName.startsWith('component.')) {
              const componentName = change.fieldName.replace('component.', '');
              const existingComponent = bom.components.find(c => c.name === componentName);

              if (change.changeType === 'modified' && existingComponent) {
                // Parse new value for quantity if applicable
                const quantityMatch = change.newValue.match(/(\d+)/);
                if (quantityMatch) {
                  existingComponent.quantity = parseInt(quantityMatch[1], 10);
                }
              } else if (change.changeType === 'added') {
                bom.components.push({
                  id: `comp-${Date.now()}`,
                  name: componentName,
                  partNumber: `PN-${componentName.toUpperCase().replace(/\s/g, '-')}`,
                  quantity: parseInt(change.newValue, 10) || 1,
                  unit: 'pcs',
                  cost: 0
                });
              } else if (change.changeType === 'removed' && existingComponent) {
                bom.components = bom.components.filter(c => c.name !== componentName);
              }
            }
          }

          // Update BOM version
          bom.version = newVersionStr;
          await bom.save();

          // Also update the product version and history
          product.version = newVersionStr;
          product.versions.push({
            version: newVersionStr,
            date: new Date(),
            changedBy: user.name,
            ecoId: eco._id.toString(),
            summary: eco.title
          });
          await product.save();
        }
      }

      eco.newVersion = newVersionStr;
    } else {
      // No version bump — still apply field changes if any
      if (eco.type === 'Product') {
        for (const change of eco.changes) {
          if (change.changeType === 'modified' || change.changeType === 'added') {
            const fieldName = change.fieldName.toLowerCase();
            if (product.schema.paths[fieldName]) {
              product[fieldName] = change.newValue;
            }
          }
        }

        product.versions.push({
          version: product.version,
          date: new Date(),
          changedBy: user.name,
          ecoId: eco._id.toString(),
          summary: eco.title
        });

        await product.save();
      }

      if (eco.type === 'BoM' && eco.bomId) {
        const bom = await BOM.findById(eco.bomId);
        if (bom) {
          for (const change of eco.changes) {
            if (change.fieldName && change.fieldName.startsWith('component.')) {
              const componentName = change.fieldName.replace('component.', '');
              const existingComponent = bom.components.find(c => c.name === componentName);

              if (change.changeType === 'modified' && existingComponent) {
                const quantityMatch = change.newValue.match(/(\d+)/);
                if (quantityMatch) {
                  existingComponent.quantity = parseInt(quantityMatch[1], 10);
                }
              }
            }
          }
          await bom.save();
        }
      }
    }

    // Update ECO stage to Done
    eco.stage = 'Done';
    await eco.save();

    // 6. Notify ECO creator that it's been approved
    if (eco.createdBy) {
      await createNotification({
        userId: eco.createdBy,
        title: `ECO "${eco.title}" (${eco.ecoNumber}) has been approved and applied`,
        type: 'info',
        ecoId: eco._id
      });
    }

    console.log(`[ECO Service] ECO ${eco.ecoNumber} applied successfully`);
    return eco;
  } catch (error) {
    console.error('[ECO Service] Error applying ECO:', error.message);
    throw error;
  }
};

/**
 * Add an approval log entry to an ECO
 */
const addApprovalLog = async (ecoId, userName, action, comment = '') => {
  try {
    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');

    eco.approvalLogs.push({
      userName,
      action,
      timestamp: new Date(),
      comment
    });

    await eco.save();
    return eco;
  } catch (error) {
    console.error('[ECO Service] Error adding approval log:', error.message);
    throw error;
  }
};

module.exports = {
  generateEcoNumber,
  applyECO,
  addApprovalLog
};
