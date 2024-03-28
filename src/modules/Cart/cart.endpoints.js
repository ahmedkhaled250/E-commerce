import { roles } from "../../middleware/auth.js";

const endPoint = {
  cart: [roles.User,roles.Admin],
};
export default endPoint;
