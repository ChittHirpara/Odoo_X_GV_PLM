const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import models
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const BOM = require('./src/models/BOM');
const ECO = require('./src/models/ECO');
const Notification = require('./src/models/Notification');

const seedDB = async () => {
  try {
    console.log('\n🌱 Starting PLM Database Seed...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await BOM.deleteMany({});
    await ECO.deleteMany({});
    await Notification.deleteMany({});
    console.log('✅ All collections cleared\n');

    // ─────────────── USERS ───────────────
    console.log('👥 Creating users...');
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@plm.com',
        password: 'admin123',
        role: 'Admin',
        avatar: null
      },
      {
        name: 'Engineer User',
        email: 'engineer@plm.com',
        password: 'engineer123',
        role: 'Engineering User',
        avatar: null
      },
      {
        name: 'Approver User',
        email: 'approver@plm.com',
        password: 'approver123',
        role: 'Approver',
        avatar: null
      },
      {
        name: 'Operations User',
        email: 'ops@plm.com',
        password: 'ops123',
        role: 'Operations User',
        avatar: null
      }
    ]);

    const admin = users[0];
    const engineer = users[1];
    const approver = users[2];
    const opsUser = users[3];

    console.log(`   ✅ ${users.length} users created`);
    users.forEach(u => console.log(`      • ${u.email} (${u.role})`));

    // ─────────────── PRODUCTS ───────────────
    console.log('\n📦 Creating products...');
    const products = await Product.create([
      {
        name: 'iPhone 17',
        sku: 'IPHONE-17-PRO',
        version: 'v1',
        status: 'Active',
        category: 'Electronics',
        description: 'Next-generation smartphone with advanced AI capabilities, titanium frame, and improved camera system.',
        price: 1199.99,
        weight: '185g',
        material: 'Titanium + Ceramic Shield Glass',
        versions: [
          {
            version: 'v1',
            date: new Date('2024-01-15'),
            changedBy: 'Admin User',
            ecoId: '',
            summary: 'Initial product creation'
          }
        ]
      },
      {
        name: 'Wooden Chair',
        sku: 'FURN-WC-001',
        version: 'v1',
        status: 'Active',
        category: 'Furniture',
        description: 'Handcrafted solid oak dining chair with ergonomic design and premium finish.',
        price: 249.99,
        weight: '8.5kg',
        material: 'Solid Oak Wood',
        versions: [
          {
            version: 'v1',
            date: new Date('2024-02-01'),
            changedBy: 'Admin User',
            ecoId: '',
            summary: 'Initial product creation'
          }
        ]
      }
    ]);

    const iphone = products[0];
    const chair = products[1];
    console.log(`   ✅ ${products.length} products created`);

    // ─────────────── BOMs ───────────────
    console.log('\n🔧 Creating BOMs...');
    const boms = await BOM.create([
      {
        name: 'iPhone 17 BOM',
        productId: iphone._id,
        version: 'v1',
        status: 'Active',
        components: [
          { id: 'comp-001', name: 'Battery', partNumber: 'BAT-LI-4500', quantity: 1, unit: 'pcs', cost: 45.00 },
          { id: 'comp-002', name: 'Screen', partNumber: 'SCR-OLED-6.7', quantity: 1, unit: 'pcs', cost: 120.00 },
          { id: 'comp-003', name: 'Processor', partNumber: 'CPU-A19-BIO', quantity: 1, unit: 'pcs', cost: 85.00 },
          { id: 'comp-004', name: 'Screws', partNumber: 'SCR-PH-M2', quantity: 12, unit: 'pcs', cost: 0.50 }
        ],
        operations: [
          { id: 'op-001', name: 'PCB Assembly', workCenter: 'SMT Line', duration: '45min' },
          { id: 'op-002', name: 'Display Bonding', workCenter: 'Clean Room', duration: '20min' },
          { id: 'op-003', name: 'Final Assembly', workCenter: 'Assembly Line', duration: '30min' },
          { id: 'op-004', name: 'Quality Test', workCenter: 'QC Lab', duration: '15min' }
        ]
      },
      {
        name: 'Wooden Chair BOM',
        productId: chair._id,
        version: 'v1',
        status: 'Active',
        components: [
          { id: 'comp-101', name: 'Wooden Legs', partNumber: 'WD-LEG-OAK', quantity: 4, unit: 'pcs', cost: 12.00 },
          { id: 'comp-102', name: 'Wooden Top', partNumber: 'WD-SEAT-OAK', quantity: 1, unit: 'pcs', cost: 35.00 },
          { id: 'comp-103', name: 'Screws', partNumber: 'SCR-WD-M4', quantity: 12, unit: 'pcs', cost: 0.25 },
          { id: 'comp-104', name: 'Varnish', partNumber: 'FIN-VAR-CLR', quantity: 1, unit: 'litre', cost: 18.00 }
        ],
        operations: [
          { id: 'op-101', name: 'Assembly', workCenter: 'Woodshop', duration: '60min' },
          { id: 'op-102', name: 'Painting', workCenter: 'Paint Booth', duration: '30min' },
          { id: 'op-103', name: 'Packing', workCenter: 'Packing Area', duration: '20min' }
        ]
      }
    ]);

    const iphoneBom = boms[0];
    const chairBom = boms[1];

    // Link BOMs to products
    iphone.bomId = iphoneBom._id;
    chair.bomId = chairBom._id;
    await iphone.save();
    await chair.save();

    console.log(`   ✅ ${boms.length} BOMs created and linked to products`);

    // ─────────────── ECOs ───────────────
    console.log('\n📋 Creating ECOs...');

    const currentYear = new Date().getFullYear();

    // ECO 1 — New stage (change iPhone 17 screw count)
    const eco1 = await ECO.create({
      title: 'Update iPhone 17 Screw Count',
      ecoNumber: `ECO-${currentYear}-001`,
      type: 'BoM',
      productId: iphone._id,
      bomId: iphoneBom._id,
      stage: 'New',
      priority: 'Low',
      createdBy: engineer._id,
      effectiveDate: new Date('2024-06-01'),
      versionUpdate: false,
      description: 'Change screw count from 12 to 14 for improved structural integrity in the housing assembly.',
      changes: [
        {
          fieldName: 'component.Screws',
          oldValue: '12',
          newValue: '14',
          changeType: 'modified'
        }
      ],
      approvalLogs: [
        {
          userName: 'Engineer User',
          action: 'ECO Created',
          timestamp: new Date(),
          comment: 'ECO created by Engineer User'
        }
      ]
    });

    // ECO 2 — In Review stage (update Wooden Chair price)
    const eco2 = await ECO.create({
      title: 'Update Wooden Chair Price',
      ecoNumber: `ECO-${currentYear}-002`,
      type: 'Product',
      productId: chair._id,
      bomId: chairBom._id,
      stage: 'In Review',
      priority: 'Medium',
      createdBy: engineer._id,
      effectiveDate: new Date('2024-07-01'),
      versionUpdate: false,
      description: 'Increase the price from $249.99 to $279.99 due to rising raw material costs for solid oak.',
      changes: [
        {
          fieldName: 'price',
          oldValue: '249.99',
          newValue: '279.99',
          changeType: 'modified'
        }
      ],
      approvalLogs: [
        {
          userName: 'Engineer User',
          action: 'ECO Created',
          timestamp: new Date(Date.now() - 86400000 * 3),
          comment: 'ECO created by Engineer User'
        },
        {
          userName: 'Engineer User',
          action: 'Submitted for Review',
          timestamp: new Date(Date.now() - 86400000 * 2),
          comment: 'Ready for engineering review'
        }
      ]
    });

    // ECO 3 — Approval stage (change battery component)
    const eco3 = await ECO.create({
      title: 'Upgrade iPhone 17 Battery Component',
      ecoNumber: `ECO-${currentYear}-003`,
      type: 'BoM',
      productId: iphone._id,
      bomId: iphoneBom._id,
      stage: 'Approval',
      priority: 'High',
      createdBy: engineer._id,
      effectiveDate: new Date('2024-08-01'),
      versionUpdate: true,
      newVersion: 'v2',
      description: 'Replace current 4500mAh battery with new 5000mAh solid-state battery for improved performance and safety.',
      changes: [
        {
          fieldName: 'component.Battery',
          oldValue: 'BAT-LI-4500 (4500mAh Li-Ion)',
          newValue: 'BAT-SS-5000 (5000mAh Solid State)',
          changeType: 'modified'
        }
      ],
      approvalLogs: [
        {
          userName: 'Engineer User',
          action: 'ECO Created',
          timestamp: new Date(Date.now() - 86400000 * 7),
          comment: 'ECO created by Engineer User'
        },
        {
          userName: 'Engineer User',
          action: 'Submitted for Review',
          timestamp: new Date(Date.now() - 86400000 * 5),
          comment: 'All component specs validated'
        },
        {
          userName: 'Engineer User',
          action: 'Advanced to Approval',
          timestamp: new Date(Date.now() - 86400000 * 2),
          comment: 'Engineering review complete, ready for approval'
        }
      ]
    });

    // ECO 4 — Done stage (already applied, version bumped)
    const eco4 = await ECO.create({
      title: 'Add Backrest to Wooden Chair',
      ecoNumber: `ECO-${currentYear}-004`,
      type: 'BoM',
      productId: chair._id,
      bomId: chairBom._id,
      stage: 'Done',
      priority: 'Medium',
      createdBy: engineer._id,
      effectiveDate: new Date('2024-04-01'),
      versionUpdate: true,
      newVersion: 'v2',
      description: 'Added wooden backrest component to the chair design for improved ergonomics and customer comfort.',
      changes: [
        {
          fieldName: 'component.Wooden Backrest',
          oldValue: '',
          newValue: '1',
          changeType: 'added'
        }
      ],
      approvalLogs: [
        {
          userName: 'Engineer User',
          action: 'ECO Created',
          timestamp: new Date(Date.now() - 86400000 * 30),
          comment: 'ECO created by Engineer User'
        },
        {
          userName: 'Engineer User',
          action: 'Submitted for Review',
          timestamp: new Date(Date.now() - 86400000 * 28),
          comment: 'Design completed and validated'
        },
        {
          userName: 'Engineer User',
          action: 'Advanced to Approval',
          timestamp: new Date(Date.now() - 86400000 * 25),
          comment: 'Engineering review passed'
        },
        {
          userName: 'Approver User',
          action: 'Approved',
          timestamp: new Date(Date.now() - 86400000 * 20),
          comment: 'Approved — backrest addition improves product value'
        }
      ]
    });

    console.log(`   ✅ 4 ECOs created (New, In Review, Approval, Done)`);

    // ─────────────── NOTIFICATIONS ───────────────
    console.log('\n🔔 Creating notifications...');
    await Notification.create([
      {
        userId: approver._id,
        title: `ECO "Upgrade iPhone 17 Battery Component" is ready for your approval`,
        type: 'approval',
        ecoId: eco3._id,
        read: false
      },
      {
        userId: engineer._id,
        title: `ECO "Add Backrest to Wooden Chair" (ECO-${currentYear}-004) has been approved and applied`,
        type: 'info',
        ecoId: eco4._id,
        read: true
      },
      {
        userId: admin._id,
        title: `New ECO "Update iPhone 17 Screw Count" created by Engineer User`,
        type: 'info',
        ecoId: eco1._id,
        read: false
      }
    ]);
    console.log('   ✅ 3 notifications created');

    // ─────────────── SUMMARY ───────────────
    console.log('\n' + '═'.repeat(50));
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('═'.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`   • ${users.length} Users`);
    console.log(`   • ${products.length} Products`);
    console.log(`   • ${boms.length} BOMs`);
    console.log(`   • 4 ECOs`);
    console.log(`   • 3 Notifications`);
    console.log('\n🔑 Login Credentials:');
    console.log('   ┌──────────────────────┬───────────────┬────────────────────┐');
    console.log('   │ Email                │ Password      │ Role               │');
    console.log('   ├──────────────────────┼───────────────┼────────────────────┤');
    console.log('   │ admin@plm.com        │ admin123      │ Admin              │');
    console.log('   │ engineer@plm.com     │ engineer123   │ Engineering User   │');
    console.log('   │ approver@plm.com     │ approver123   │ Approver           │');
    console.log('   │ ops@plm.com          │ ops123        │ Operations User    │');
    console.log('   └──────────────────────┴───────────────┴────────────────────┘');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed error:', error);
    process.exit(1);
  }
};

seedDB();
