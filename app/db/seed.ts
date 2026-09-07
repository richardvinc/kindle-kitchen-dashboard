import { getDateGMT7 } from "../helpers";
import { db } from "./db";
import * as schema from "./schema";

await db.insert(schema.ingredients).values([
  {
    name: "odeng/fishcake",
  },
  {
    name: "sawi putih",
  },
  {
    name: "jamur champignon",
  },
  {
    name: "lean ground beef",
  },
  {
    name: "ikan dori",
  },
  {
    name: "miso",
  },
]);

await db.insert(schema.menus).values([
  {
    name: "tumis odeng sawi putih",
  },
  {
    name: "mun tahu",
  },
  {
    name: "dori sawi putih",
  },
]);

await db.insert(schema.menuSchedules).values([
  {
    name: "tumis odeng sawi putih",
    date: getDateGMT7(),
    ingredients: [
      {
        ingredientName: "odeng",
        amount: "100 gram",
      },
      {
        ingredientName: "jamur",
        amount: "100 gram",
      },
      {
        ingredientName: "sawi putih",
        amount: "200 gram",
      },
      {
        ingredientName: "telur",
        amount: "2 buah",
      },
      {
        ingredientName: "nasi richard",
        amount: "150 gram",
      },
      {
        ingredientName: "nasi michelle",
        amount: "130 gram",
      },
    ],
  },
  {
    name: "mun tahu",
    date: getDateGMT7(2),
    ingredients: [
      {
        ingredientName: "tofu firm",
        amount: "300 gram",
      },
      {
        ingredientName: "lean ground beef",
        amount: "sisa di kulkas",
      },
      {
        ingredientName: "jamur champignon",
        amount: "100 gram",
      },
      {
        ingredientName: "nasi richard",
        amount: "150 gram",
      },
      {
        ingredientName: "nasi michelle",
        amount: "130 gram",
      },
    ],
  },
  {
    name: "dori sawi putih",
    date: getDateGMT7(3),
    ingredients: [
      {
        ingredientName: "ikan dori",
        amount: "500 gram",
      },
      {
        ingredientName: "sawi putih",
        amount: "200 gram",
      },
      {
        ingredientName: "miso",
        amount: "2 tbsp",
      },
      {
        ingredientName: "nasi richard",
        amount: "150 gram",
      },
      {
        ingredientName: "nasi michelle",
        amount: "130 gram",
      },
    ],
  },
]);
