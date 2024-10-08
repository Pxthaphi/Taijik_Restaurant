import Cookies from "js-cookie";

export function getUserType() {
  return Cookies.get("userType");
}
