import { db } from "./src/db/connection"


const client = await db.client.findMany({
    where:{
        numberBI:{
            contains:"k "
        }
    }
})
console.log(client)