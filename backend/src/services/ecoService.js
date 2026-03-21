const ECO = require('../models/ECO');
const Product = require('../models/Product');
const BOM = require('../models/BOM');
const User = require('../models/User');

const generateEcoNumber = async () => {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `ECO-${currentYear}-`;

  const count = await ECO.countDocuments({
    ecoNumber: { $regex: `^${yearPrefix}` }
  });

  const nextNumber = (count + 1).toString().padStart(3, '0');
  return `${yearPrefix}${nextNumber}`;
};

const applyECO = async (ecoId, userId) => {
  try {
    const eco = await ECO.findOne({ _id: ecoId });
    if (!eco) throw new Error('ECO not found');

    const user = await User.findOne({ _id: userId });
    if (!user) throw new Error('User not found');

    if (!eco.ecoNumber) {
      eco.ecoNumber = await generateEcoNumber();
    }

    const product = await Product.findOne({ _id: eco.productId });
    if (!product) throw new Error('Associated product not found');

    if (eco.versionUpdate && eco.newVersion) {
      product.version = eco.newVersion;
      product.versions.push({
        version: eco.newVersion,
        date: new Date().toISOString().slice(0, 10),
        changedBy: user.name,
        eco: eco.ecoNumber,
        summary: eco.title
      });
      product.updatedAt = new Date().toISOString().slice(0, 10);
      await product.save();

      if (eco.type === 'BoM' && eco.bomId) {
        const bom = await BOM.findOne({ _id: eco.bomId });
        if (bom) {
          bom.version = eco.newVersion;
          await bom.save();
        }
      }
    }

    eco.stage = 'Done';
    eco.approvalLogs.push({
      user: 'System',
      action: 'Applied to Production',
      timestamp: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      comment: `Changes applied. ${eco.type === 'BoM' ? 'BoM' : 'Product'} updated to ${eco.newVersion || product.version}.`
    });
    await eco.save();

    return eco;
  } catch (error) {
    throw error;
  }
};

const addApprovalLog = async (ecoId, userName, action, comment = '') => {
  try {
    const eco = await ECO.findOne({ _id: ecoId });
    if (!eco) throw new Error('ECO not found');

    eco.approvalLogs.push({
      user: userName,
      action,
      timestamp: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      comment
    });

    await eco.save();
    return eco;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateEcoNumber,
  applyECO,
  addApprovalLog
};

