import Cookies from "js-cookie";

export function getUserID() {
  return Cookies.get("UserID");
}
