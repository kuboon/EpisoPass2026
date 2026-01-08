export const lib = {
  show: function (id: string): void {
    const contents = document.querySelector("#contents");
    if (contents) {
      const children = contents.children;
      for (let i = 0; i < children.length; i++) {
        (children[i] as HTMLElement).style.display = "none";
      }
    }
    const element = document.querySelector(id);
    if (element) {
      (element as HTMLElement).style.display = "block";
    }
  },
};
