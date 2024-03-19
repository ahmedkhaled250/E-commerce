import { roles } from "../../middleware/auth.js";

const endPoint = {
  product: [roles.vendor],
};
export default endPoint