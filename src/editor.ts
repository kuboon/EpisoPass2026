//
//  editor.ts - EpisoPass問題編集画面
//
//  Toshiyuki Masui @ Pitecan.com
//  Modified       2015/10/31 19:12:53
//  Modified       2018/02/23 17:24:33 for heroku
//  Modified       2019/12/23 サーバを使わないように修正
//  Converted to TypeScript: 2026/01/07
//

import { lib } from "./lib.ts";
import { crypt } from "./crypt.ts";

// DOM操作ヘルパー関数
function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attrs?: Record<string, string>,
  styles?: Partial<CSSStyleDeclaration>,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tagName);
  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "class") {
        el.className = value;
      } else {
        el.setAttribute(key, value);
      }
    });
  }
  if (styles) {
    Object.assign(el.style, styles);
  }
  return el;
}

declare let data: any;
declare let questions: string[];
declare let answers: string[];

let answerArray: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

export function editor(dataArg?: any): void {
  if (dataArg !== undefined) {
    data = dataArg;
  }

  console.log("data-----");
  console.log(data);

  (document.querySelector("#descbuttondiv") as HTMLElement).style.background =
    "#555";
  (document.querySelector("#episodbbuttondiv") as HTMLElement).style
    .background = "#555";
  (document.querySelector("#editbuttondiv") as HTMLElement).style.background =
    "#999";

  const globaldata = data; // グローバル変数「data」にアクセスするための苦しい工夫
  const name = data.name;
  const qas = data.qas;
  let curq = 0;
  let cura = 0;

  answerArray = []; // answerArray[q] = a のとき、q番目の質問の答がa番目である

  const selfunc = (q: number, a: number) => { // q番目の質問のa番目の選択肢をクリックしたとき呼ばれる関数
    return () => {
      answerArray[q] = a;
      for (let i = 0; i < qas[q]["answers"].length; i++) {
        const elem = document.querySelector(
          `#answer${q}-${i}`,
        ) as HTMLInputElement;
        if (elem) {
          elem.style.backgroundColor = i == a ? "#555" : "#fff";
          elem.style.color = i == a ? "#fff" : "#555";
        }
      }
      calcpass(true);
    };
  };

  const editfunc = (q: number, a: number) => { // q番目の質問のa番目の選択肢を編集したとき呼ばれる関数
    return () => {
      curq = q;
      cura = a;
      const elem = document.querySelector(
        `#answer${q}-${a}`,
      ) as HTMLInputElement;
      if (elem) {
        qas[q]["answers"][a] = elem.value;
      }
      calcpass();
    };
  };

  let timeout: number | null = null;
  const hover_in_func = (q: number, a: number) => {
    return () => {
      timeout = window.setTimeout(selfunc(q, a), 400);
    };
  };
  const hover_out_func = () => {
    return () => {
      if (timeout !== null) clearTimeout(timeout);
    };
  };

  // f4ba35ab6069e8bcf9ef62bf73d12fd1.png のような表示
  const answerspan = (q: number, a: number) => { // q番目の質問のa番目の選択肢のspan
    const aspan = createElement("span", { class: "answer" });
    const input = createElement("input", {
      type: "text",
      autocomplete: "off",
      class: "answer",
      id: `answer${q}-${a}`,
    }, {
      backgroundColor: a == 0 ? "#555" : "#fff",
      color: a == 0 ? "#fff" : "#555",
    });
    (input as HTMLInputElement).value = qas[q]["answers"][a];
    input.addEventListener("click", selfunc(q, a));
    input.addEventListener("keyup", editfunc(q, a));
    aspan.appendChild(input);
    return aspan;
  };

  const showimage = (str: string, img: HTMLImageElement) => {
    if (str.match(/\.(png|jpeg|jpg|gif)$/i)) {
      img.src = str;
      img.style.display = "block";
    } else {
      img.style.display = "none";
    }
  };

  const qeditfunc = (q: number) => { // q番目の問題を編集したとき呼ばれる関数
    return () => {
      const elem = document.querySelector(`#question${q}`) as HTMLInputElement;
      const str = elem ? elem.value : "";
      qas[q]["question"] = str;
      const img = document.querySelector(`#image${q}`) as HTMLImageElement;
      showimage(str, img);
      calcpass();
    };
  };

  const minusfunc = (q: number) => { // q番目の問題の「-」ボタンを押したとき呼ばれる関数
    return () => {
      qas[q]["answers"].pop();
      const elem = document.querySelector(
        `#answer${q}-${qas[q]["answers"].length}`,
      );
      elem?.remove();
    };
  };

  const plusfunc = (q: number) => { // q番目の問題の「+」ボタンを押したとき呼ばれる関数
    return () => {
      const nelements = qas[q]["answers"].length;
      qas[q]["answers"].push("新しい回答例");
      const delim = document.querySelector(`#delim${q}`);
      if (delim) {
        delim.parentNode?.insertBefore(answerspan(q, nelements), delim);
      }
    };
  };

  const qadiv = (q: number) => { // q番目の質問+選択肢のdiv
    answerArray[q] = 0;
    const div = createElement("div", { class: "qadiv", id: `qadiv${q}` });
    const qdiv = createElement("div", { class: "qdiv" });
    qdiv.setAttribute("width", "100%");
    const qstr = qas[q]["question"];
    const qinput = createElement("input", {
      type: "text",
      autocomplete: "off",
      class: "qinput",
      id: `question${q}`,
    });
    (qinput as HTMLInputElement).value = qstr;
    qinput.addEventListener("keyup", qeditfunc(q));
    qdiv.appendChild(qinput);
    div.appendChild(qdiv);

    const img = createElement("img", {
      class: "qimg",
      id: `image${q}`,
    }) as HTMLImageElement;
    div.appendChild(img);
    showimage(qstr, img);

    const ansdiv = createElement("div", { class: "ansdiv" });
    for (let i = 0; i < qas[q]["answers"].length; i++) {
      ansdiv.appendChild(answerspan(q, i));
    }
    const delim = createElement("span", { id: `delim${q}` });
    delim.textContent = "  ";
    ansdiv.appendChild(delim);

    div.appendChild(ansdiv);
    const br = createElement("br");
    br.setAttribute("clear", "all");
    div.appendChild(br);

    return div;
  };

  const maindiv = () => {
    const main = document.querySelector("#main");
    if (main) {
      while (main.firstChild) {
        main.removeChild(main.firstChild);
      }
      for (let i = 0; i < qas.length; i++) {
        main.appendChild(qadiv(i));
      }
    }
  };

  const secretstr = (): string => { // 質問文字列と選択された文字列をすべて接続した文字列
    return Array.from({ length: qas.length }, (_, i) => {
      return qas[i]["question"] + qas[i]["answers"][answerArray[i]];
    }).join("");
  };

  const calcpass = (copy?: boolean) => { // シード文字列からパスワード文字列を生成
    const seedElem = document.querySelector("#seed") as HTMLInputElement;
    const passElem = document.querySelector("#pass") as HTMLInputElement;
    if (seedElem && passElem) {
      const newpass = crypt(seedElem.value, secretstr());
      passElem.value = newpass;
    }
  };

  const calcseed = () => { // パスワード文字列からシード文字列を生成
    const seedElem = document.querySelector("#seed") as HTMLInputElement;
    const passElem = document.querySelector("#pass") as HTMLInputElement;
    if (seedElem && passElem) {
      const newseed = crypt(passElem.value, secretstr());
      seedElem.value = newseed;
      data["seed"] = newseed;
    }
  };

  const sendfile = (files: FileList) => {
    const file = files[0];
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      // ここで「data」がどうしてもローカルになってしまうので
      // 「globaldata」というのを使う (苦しい!)
      const s = event.target?.result as string; // 読んだファイルの内容
      if (s[0] == "{") {
        data = JSON.parse(s);
      } else {
        const lines = s.split(/\n/);
        lines.forEach((line) => {
          const m = line.match(/^\s*const data = (.*)$/);
          if (m) {
            const json = m[1].replace(/;.*$/, "");
            data = JSON.parse(json);
          }
        });
      }
      const qas = data["qas"];
      const seed = data["seed"];

      globaldata["qas"] = data["qas"];
      globaldata["seed"] = data["seed"];

      questions = [];
      for (let i = 0; i < qas.length; i++) {
        questions.push(qas[i]["question"]);
      }
      answers = qas[0]["answers"];

      const seedElem = document.querySelector("#seed") as HTMLInputElement;
      if (seedElem) seedElem.value = seed;
      maindiv();
      calcpass();
    };
    fileReader.readAsText(file);
  };

  const init = () => {
    lib.show("#editor");

    //
    // seedかパスワードを編集したら相手を変更
    //
    const seedElem = document.querySelector("#seed") as HTMLInputElement;
    const passElem = document.querySelector("#pass") as HTMLInputElement;

    if (seedElem) {
      seedElem.addEventListener("keyup", () => {
        data["seed"] = seedElem.value;
        calcpass();
      });
      seedElem.value = data.seed;
    }

    if (passElem) {
      passElem.addEventListener("keyup", () => {
        calcseed();
      });
    }

    // Drag&Drop対応
    document.body.addEventListener("dragover", (e) => {
      e.preventDefault();
      return false;
    });
    document.body.addEventListener("dragend", (e) => {
      return false;
    });
    document.body.addEventListener("drop", (e) => {
      e.preventDefault(); // デフォルトは「ファイルを開く」
      const files = e.dataTransfer?.files;
      if (files) sendfile(files);
    });

    maindiv();
    calcpass();
  };

  init();
}

export function answer(): number[] {
  return answerArray;
}
