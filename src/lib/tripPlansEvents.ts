export const TRIP_PLANS_CHANGED_EVENT = "trip_plans_changed";

export function dispatchTripPlansChanged() {
  window.dispatchEvent(new Event(TRIP_PLANS_CHANGED_EVENT));
}
