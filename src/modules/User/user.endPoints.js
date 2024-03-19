import { roles } from "../../middleware/auth.js";

const endPoint = {
  allUsers: [roles.vendor, roles.Admin, roles.User],
  blockUser: [roles.Admin],
};
export default endPoint;
