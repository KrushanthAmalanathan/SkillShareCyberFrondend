
import axios from "axios";
import { ActivityLogEndPoint } from "./ApiRequest"; 

/**
 * Send a new activity entry to the server.
 * @param {string} category  One of: "Template Added", "Product Updated", etc.
 * @param {string} description  Free-form detail (e.g. “Clicked Save” or “Viewed Dashboard”).
 */
export async function logActivity(category, description) {
  try {
    await axios.post(ActivityLogEndPoint, {
      category,
      description,
    });
  } catch (err) {
    // you can choose to silently fail, or show a console warning:
    console.warn("Activity log failed:", err);
  }
}
