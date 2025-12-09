const prisma = require('../utills/db');
const { asyncHandler, AppError } = require('../utills/errorHandler');

// Ensure requester is admin
function requireAdmin(req) {
  const role = req.user?.role || req.user?.Role;
  if (!role || role.toUpperCase() !== 'ADMIN') {
    throw new AppError('Forbidden: Admin only', 403);
  }
}

const listUsers = asyncHandler(async (req, res) => {
  requireAdmin(req);
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;

  const [total, users] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.findMany({ where: { deletedAt: null }, skip, take: limit, orderBy: { email: 'asc' } })
  ]);

  const usersSanitized = users.map(u => {
    const { password, ...rest } = u; return rest;
  });
  res.status(200).json({ users: usersSanitized, total, page, limit });
});

const blockUser = asyncHandler(async (req, res) => {
  requireAdmin(req);
  const { id } = req.params;
  const user = await prisma.user.update({ where: { id }, data: { status: 'BLOCKED' } });
  const { password, ...rest } = user;
  res.status(200).json(rest);
});

const unblockUser = asyncHandler(async (req, res) => {
  requireAdmin(req);
  const { id } = req.params;
  const user = await prisma.user.update({ where: { id }, data: { status: 'ACTIVE' } });
  const { password, ...rest } = user;
  res.status(200).json(rest);
});

const softDeleteUser = asyncHandler(async (req, res) => {
  requireAdmin(req);
  const { id } = req.params;
  const user = await prisma.user.update({ where: { id }, data: { deletedAt: new Date(), status: 'DELETED' } });
  const { password, ...rest } = user;
  res.status(200).json({ ...rest, message: 'User deleted successfully' });
});

const overview = asyncHandler(async (req, res) => {
  requireAdmin(req);
  
  // Calculate date ranges
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers, 
    totalOrders, 
    totalProducts, 
    totalMerchants, 
    revenueAgg,
    orders,
    products
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.customer_order.count(),
    prisma.product.count(),
    prisma.merchant.count(),
    prisma.customer_order.aggregate({ _sum: { total: true } }),
    prisma.customer_order.findMany({ 
      select: { dateTime: true, total: true, status: true } 
    }),
    prisma.product.findMany({ 
      select: { inStock: true } 
    })
  ]);

  // Calculate revenue by period
  const revenueToday = orders
    .filter(o => o.dateTime && o.dateTime >= todayStart)
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const revenueWeek = orders
    .filter(o => o.dateTime && o.dateTime >= weekStart)
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const revenueMonth = orders
    .filter(o => o.dateTime && o.dateTime >= monthStart)
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Calculate order status counts
  const ordersProcessing = orders.filter(o => 
    o.status && ['PENDING', 'PROCESSING', 'CONFIRMED'].includes(o.status.toUpperCase())
  ).length;

  const ordersDelivered = orders.filter(o => 
    o.status && o.status.toUpperCase() === 'DELIVERED'
  ).length;

  const ordersCancelled = orders.filter(o => 
    o.status && ['CANCELLED', 'FAILED'].includes(o.status.toUpperCase())
  ).length;

  // Calculate low stock products (less than 10 items)
  const lowStockProducts = products.filter(p => 
    p.inStock !== null && p.inStock < 10
  ).length;

  res.status(200).json({
    totalUsers,
    totalOrders,
    totalRevenue: revenueAgg._sum.total || 0,
    totalProducts,
    totalMerchants,
    revenueToday,
    revenueWeek,
    revenueMonth,
    ordersProcessing,
    ordersDelivered,
    ordersCancelled,
    lowStockProducts
  });
});

const revenue = asyncHandler(async (req, res) => {
  requireAdmin(req);
  const groupBy = (req.query.groupBy || 'day').toLowerCase();
  const orders = await prisma.customer_order.findMany({ select: { dateTime: true, total: true } });
  const map = new Map();
  orders.forEach(o => {
    const d = o.dateTime ? o.dateTime.toISOString().substring(0, 10) : new Date().toISOString().substring(0,10);
    map.set(d, (map.get(d) || 0) + (o.total || 0));
  });
  const data = Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
  const total = data.reduce((s, r) => s + r.revenue, 0);
  res.status(200).json({ data, total, groupBy });
});

const topProducts = asyncHandler(async (req, res) => {
  requireAdmin(req);
  const limit = parseInt(req.query.limit || '10', 10);
  // Fetch products with order items
  const products = await prisma.product.findMany({
    include: { customerOrders: true }
  });
  const ranked = products.map(p => {
    const totalSold = p.customerOrders.reduce((s, it) => s + it.quantity, 0);
    const revenue = (p.price || 0) * totalSold;
    return { id: p.id, name: p.title, totalSold, revenue };
  }).sort((a,b) => b.totalSold - a.totalSold).slice(0, limit);
  res.status(200).json({ products: ranked });
});

// Admin: list orders with optional filters
const listOrders = asyncHandler(async (req, res) => {
  requireAdmin(req);
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;
  const { status } = req.query;

  const where = {};
  if (status) {
    // Our schema may use different status values; for now, filter strictly when it matches
    where.status = status;
  }

  const [total, orders] = await Promise.all([
    prisma.customer_order.count({ where }),
    prisma.customer_order.findMany({ where, skip, take: limit, orderBy: { dateTime: 'desc' } })
  ]);

  res.status(200).json({ orders, total, page, limit });
});

module.exports = {
  listUsers,
  blockUser,
  unblockUser,
  softDeleteUser,
  overview,
  revenue,
  topProducts,
  listOrders
};
