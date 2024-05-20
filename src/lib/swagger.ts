export function Schema(tags: string[]) {
  let schema = {
    tags
  }
  return schema
}


export const Driverschema = { schema: Schema(["drivers"]) }
export const Clientchema = { schema: Schema(["clients"]) }
