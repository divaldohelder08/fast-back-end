import dayjs from "dayjs"

const now = dayjs().startOf("hours").set("hour",1).toDate()
console.log(now)