export const roles = {
  USER: "user",
  VISITOR: "seller",
  ADMIN: "admin",
};
Object.freeze(roles);

export const gender = {
  MALE: "male",
  FEMALE: "female",
};
export const status = {
  BLOCKED: "blocked",
  PENDING: "pending",
  VERIFIED: "verified",
  DELETED: "deleted",
};
Object.freeze(status);

export const couponTypes = {
  FIXED_AMOUNT: "fixedAmount",
  PERCENTAGE: "percentage",
};
Object.freeze(couponTypes);

export const orderStatus = {
  PLACED: "placed",
  SHIPPING: "shipping",
  COMPLETED: "completed",
  CANCELED: "canceled",
  REFUNDED: "refund",
};
Object.freeze(orderStatus);

export const payments = {
  CASH: "cash",
  VISA: "visa",
};
Object.freeze(payments);

export const replay = {
  REPLIED: "replied",
  INPROGRESS: "in progress",
  PENDING: "pending",
};
