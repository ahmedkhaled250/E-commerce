import { Schema, Types, model } from "mongoose";

const cartSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      unique: [true, "only one cart for each user"],
      required: [true, "userId is required"],
    },
    products: {
      type: [
        {
          productId: {
            type: Types.ObjectId,
            ref: "Product",
          },
          quantity: Number,
        },
      ],
      required: [true, "products are required"],
    },
  },
  {
    timestamps: true,
  }
);

const cartModel = model("Cart", cartSchema);
export default cartModel;
