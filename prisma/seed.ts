import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@minimall.com" },
    update: {},
    create: {
      email: "admin@minimall.com",
      password: adminPassword,
      name: "管理员",
      role: "ADMIN",
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // Create categories
  const categories = [
    { name: "电子产品", slug: "electronics", description: "手机、电脑、耳机等数码产品" },
    { name: "服装", slug: "clothing", description: "男装、女装、配饰等时尚单品" },
    { name: "图书", slug: "books", description: "小说、技术书籍、杂志等" },
    { name: "家居", slug: "home", description: "家具、厨具、装饰品等家居用品" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("Created categories");

  const categoryRecords = await prisma.category.findMany();
  const catMap = Object.fromEntries(
    categoryRecords.map((c) => [c.slug, c.id])
  );

  // Create products
  const products = [
    // Electronics
    {
      name: "无线蓝牙耳机 Pro",
      slug: "wireless-earbuds-pro",
      description:
        "高品质无线蓝牙耳机，支持主动降噪，续航长达 30 小时。舒适的入耳式设计，IPX5 防水等级，适合运动佩戴。",
      price: 299.0,
      imageUrl: "https://placehold.co/400x400/3b82f6/ffffff?text=Bluetooth+Earbuds",
      stock: 100,
      categoryId: catMap.electronics,
    },
    {
      name: "智能手表 Ultra",
      slug: "smartwatch-ultra",
      description:
        "全天候健康监测，GPS 定位，50 米防水。支持心率、血氧、睡眠监测，续航 14 天。",
      price: 599.0,
      imageUrl: "https://placehold.co/400x400/1e293b/f8fafc?text=Smart+Watch",
      stock: 50,
      categoryId: catMap.electronics,
    },
    {
      name: "便携充电宝 20000mAh",
      slug: "powerbank-20000",
      description:
        "超大容量 20000mAh 便携充电宝，支持 PD 快充，同时充 3 台设备。轻薄机身，随身携带方便。",
      price: 149.0,
      imageUrl: "https://placehold.co/400x400/f59e0b/ffffff?text=Power+Bank",
      stock: 200,
      categoryId: catMap.electronics,
    },
    {
      name: "机械键盘 RGB",
      slug: "mechanical-keyboard-rgb",
      description:
        "87 键紧凑布局，Cherry MX 青轴，全键 RGB 背光。PBT 键帽，铝合金面板，USB-C 接口。",
      price: 399.0,
      imageUrl: "https://placehold.co/400x400/7c3aed/ffffff?text=Mechanical+Keyboard",
      stock: 80,
      categoryId: catMap.electronics,
    },
    // Clothing
    {
      name: "经典款纯棉 T 恤",
      slug: "classic-cotton-tshirt",
      description:
        "100% 优质纯棉面料，舒适透气。经典圆领设计，简约百搭。多色可选。",
      price: 79.0,
      imageUrl: "https://placehold.co/400x400/f43f5e/ffffff?text=Cotton+T-Shirt",
      stock: 300,
      categoryId: catMap.clothing,
    },
    {
      name: "休闲运动卫衣",
      slug: "casual-hoodie",
      description:
        "加绒保暖，柔软亲肤。宽松版型，适合日常穿着。连帽设计，前袋鼠口袋。",
      price: 199.0,
      imageUrl: "https://placehold.co/400x400/8b5cf6/ffffff?text=Casual+Hoodie",
      stock: 150,
      categoryId: catMap.clothing,
    },
    {
      name: "修身牛仔裤",
      slug: "slim-fit-jeans",
      description:
        "弹力牛仔面料，修身版型。经典五袋设计，适合日常通勤和休闲场合。",
      price: 249.0,
      imageUrl: "https://placehold.co/400x400/2563eb/ffffff?text=Slim+Jeans",
      stock: 120,
      categoryId: catMap.clothing,
    },
    // Books
    {
      name: "深入理解 TypeScript",
      slug: "understanding-typescript",
      description:
        "全面讲解 TypeScript 类型系统、高级技巧与实战应用。从基础到高级，覆盖泛型、装饰器、声明文件等核心内容。",
      price: 69.0,
      imageUrl: "https://placehold.co/400x400/0891b2/ffffff?text=TypeScript",
      stock: 500,
      categoryId: catMap.books,
    },
    {
      name: "React 实战指南",
      slug: "react-practice-guide",
      description:
        "从零开始用 React 构建完整项目，涵盖 Hooks、状态管理、路由、测试等核心主题。",
      price: 59.0,
      imageUrl: "https://placehold.co/400x400/0ea5e9/ffffff?text=React+Guide",
      stock: 400,
      categoryId: catMap.books,
    },
    {
      name: "设计模式之美",
      slug: "design-patterns",
      description:
        "23 种经典设计模式的通俗解读，配合大量实战案例，助你写出可扩展、可维护的优秀代码。",
      price: 79.0,
      imageUrl: "https://placehold.co/400x400/059669/ffffff?text=Design+Patterns",
      stock: 350,
      categoryId: catMap.books,
    },
    // Home
    {
      name: "北欧简约台灯",
      slug: "nordic-table-lamp",
      description:
        "极简北欧设计，三档色温调节，无频闪 LED 光源。适合书房、卧室使用。",
      price: 129.0,
      imageUrl: "https://placehold.co/400x400/fbbf24/1e293b?text=Table+Lamp",
      stock: 80,
      categoryId: catMap.home,
    },
    {
      name: "双层隔热玻璃杯",
      slug: "double-wall-glass",
      description:
        "高硼硅玻璃材质，双层隔热设计。防烫手，保温保冷。350ml 容量，适合咖啡和茶。",
      price: 49.0,
      imageUrl: "https://placehold.co/400x400/06b6d4/ffffff?text=Glass+Cup",
      stock: 250,
      categoryId: catMap.home,
    },
    {
      name: "日式收纳盒套装",
      slug: "storage-box-set",
      description:
        "三件装收纳盒，环保 PP 材质，可叠加使用。适合衣物、玩具、杂物分类收纳。",
      price: 89.0,
      imageUrl: "https://placehold.co/400x400/d97706/ffffff?text=Storage+Box",
      stock: 180,
      categoryId: catMap.home,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log(`Created ${products.length} products`);

  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
