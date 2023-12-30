import { asyncHandler } from "../../../utils/errorHandling.js";
import { createInvoice } from "../../../utils/pdf.js";
import {
  create,
  findByIdAndUpdate,
  findOne,
  updateOne,
} from "../../../../DB/DBMethods.js";
import productModel from "../../../../DB/models/Product.js";
import couponModel from "../../../../DB/models/Coupon.js";
import orderModel from "../../../../DB/models/Order.js";
import cartModel from "../../../../DB/models/Cart.js";
import ApiFeatures from "../../../utils/apiFeatures.js";
import sendEmail from "../../../utils/sendEmail.js";

export const addOrder = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { couponName, paymentMethod } = req.body;
  if (user.deleted) {
    return next(new Error("Your account is deleted", { cause: 400 }));
  }
  if (!req.body.products) {
    const cart = await findOne({
      model: cartModel,
      condition: { userId: user._id },
    });
    if (!cart?.products.length) {
      return next(new Error("Your cart is empty", { cause: 400 }));
    }
    req.body.isCart = true;
    req.body.products = cart.products;
  }
  let coupon;
  if (couponName) {
    coupon = await findOne({
      model: couponModel,
      condition: { name: couponName.toLowerCase(), usedBy: { $nin: user._id } },
    });
    if (!coupon || coupon.expireDate.getTime() < Date.now()) {
      return next(new Error("In-valid or expired coupon", { cause: 404 }));
    }
  }
  let subtotalPrice = 0;
  const finalProducts = [];
  const productsIds = [];
  for (let product of req.body.products) {
    const checkProduct = await findOne({
      model: productModel,
      condition: {
        _id: product.productId,
        stock: { $gte: product.quantity },
      },
    });
    if (!checkProduct) {
      return next(
        new Error("In-valid product to place this order", { cause: 400 })
      );
    }
    if (productsIds.includes(checkProduct._id.toString())) {
      return next(new Error("Dupplicate product", { cause: 409 }));
    }
    productsIds.push(checkProduct._id.toString());
    if (req.body.isCart) {
      product = product.toObject();
    }
    product.name = checkProduct.name;
    product.unitePrice = checkProduct.finalPrice;
    product.finalPrice = product.quantity * checkProduct.finalPrice.toFixed(2);
    subtotalPrice += product.finalPrice;
    finalProducts.push(product);
  }
  req.body.products = finalProducts;
  req.body.subtotalPrice = subtotalPrice;
  req.body.couponId = coupon?._id;
  req.body.finalPrice =
    subtotalPrice - subtotalPrice * ((coupon?.amount || 0) / 100);
  req.body.userId = user._id;
  req.body.status = paymentMethod == "card" ? "waitPayment" : "placed";
  const order = await create({ model: orderModel, data: req.body });
  if (!order) {
    return next(new Error("Fail to add order", { cause: 400 }));
  }
  for (const product of req.body.products) {
    await findByIdAndUpdate({
      model: productModel,
      condition: product.productId,
      data: {
        $inc: {
          soldItems: parseInt(product.quantity),
          stock: -parseInt(product.quantity),
        },
      },
    });
  }
  if (couponName) {
    await findByIdAndUpdate({
      model: couponModel,
      condition: coupon._id,
      data: { $push: { usedBy: user._id } },
    });
  }
  if (req.body.isCart) {
    await updateOne({
      model: cartModel,
      condition: { userId: user._id },
      data: { products: [] },
    });
  } else {
    await updateOne({
      model: cartModel,
      condition: { userId: user._id },
      data: { $pull: { products: { productId: { $in: productsIds } } } },
    });
  }
  const invoice = {
    shipping: {
      name: user.userName,
      address: order.address,
      city: "Cairo",
      state: "aul makram streat",
      country: "Egypt",
    },
    items: order.products,
    subtotal: subtotalPrice,
    total: order.finalPrice,
    date: order.createdAt,
    invoice_nr: order.phone,
  };
  await createInvoice(invoice, "invoice.pdf");
  await sendEmail({
    to: user.email,
    subject: "invoice",
    attachments: [
      {
        path: "invoice.pdf",
        contentType: "application/pdf",
      },
    ],
  });
  return res.status(201).json({ message: "Done" });
});
export const cencelOrder = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;
  if (user.deleted) {
    return next(new Error("Your account is deleted", { cause: 400 }));
  }
  const order = await findOne({
    model: orderModel,
    condition: { _id: id, userId: user._id },
  });
  if (!order) {
    return next(new Error("In-valid order", { cause: 404 }));
  }
  if (
    (order.status != "placed" && order.paymentMethod == "cash") ||
    (order.status != "waitPayment" && order.paymentMethod == "card")
  ) {
    return next(
      new Error(
        `You can't cencel your order after it's been changed to ${order.status}`,
        { cause: 400 }
      )
    );
  }
  order.status = "cenceled";
  for (const product of order.products) {
    await updateOne({
      model: productModel,
      condition: { _id: product.productId },
      data: {
        $inc: {
          soldItems: -parseInt(product.quantity),
          stock: parseInt(product.quantity),
        },
      },
    });
  }
  if (order.couponId) {
    await updateOne({
      model: couponModel,
      condition: { userId: user._id },
      data: { $pull: { usedBy: user._id } },
    });
  }
  await order.save();
  return res.status(200).json({ message: "Done" });
});
export const userOrders = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const populate = [
    {
      path: "userId",
      select: "userName email image",
    },
    {
      path: "products.productId",
    },
    {
      path: "couponId",
      select: "name amount",
    },
  ];
  const apiFeature = new ApiFeatures(
    req.query,
    orderModel.find({ userId: user._id }).populate(populate)
  )
    .filter()
    .paginate()
    .search()
    .select()
    .sort();
  const orders = await apiFeature.mongooseQuery;
  if (!orders.length) {
    return next(new Error("In-valid orders", { cause: 404 }));
  }
  return res.status(200).json({ message: "Done", orders });
});
