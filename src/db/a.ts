import { db } from "./connection";

const filias=await db.filial.findMany({ select: { id: true, name: true } });
console.log(filias)