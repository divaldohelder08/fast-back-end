export class Split {
  id(id: string) {
    const oldId = id.split("-");
    return `${oldId[0]}-${oldId[oldId.length - 2]}-${oldId[oldId.length - 1]}`;
  }
  name(name: string) {
    const partesNome = name.split(" ");
    return partesNome
      .map((e) => {
        return e
          .split("")
          .map((e, i) => {
            if (i != 0) {
              return e;
            } else {
              return e.toLocaleUpperCase();
            }
          })
          .join("");
      })
      .join(" ");
  }
  matricula(mat: string) {
    return mat
      .split("")
      .map((e, i) => {
        if (i === 2 || i === 4 || i === 6) {
          return `-${e}`;
        } else return e;
      })
      .join("");
  }
}
const split = new Split();
export default split;
