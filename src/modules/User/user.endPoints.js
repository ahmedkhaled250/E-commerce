import { roles } from "../../middleware/auth.js";

const endPoint = {
  allUsers: [roles.Accounting, roles.Admin, roles.User],
  blockUser: [roles.Admin],
};
export default endPoint;
