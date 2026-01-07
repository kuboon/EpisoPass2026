//
//  editor.ts - EpisoPass問題編集画面
// 
//  Toshiyuki Masui @ Pitecan.com
//  Modified       2015/10/31 19:12:53
//  Modified       2018/02/23 17:24:33 for heroku
//  Modified       2019/12/23 サーバを使わないように修正
//  Converted to TypeScript: 2026/01/07
//

import $ from './jquery.ts';
import { lib } from './lib.ts';
import { crypt } from './crypt.ts';

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

  $('#descbuttondiv').css('background', '#555');
  $('#episodbbuttondiv').css('background', '#555');
  $('#editbuttondiv').css('background', '#999');

  const globaldata = data; // グローバル変数「data」にアクセスするための苦しい工夫
  const name = data.name;
  const qas = data.qas;
  let curq = 0;
  let cura = 0;

  answerArray = []; // answerArray[q] = a のとき、q番目の質問の答がa番目である

  const selfunc = (q: number, a: number) => { // q番目の質問のa番目の選択肢をクリックしたとき呼ばれる関数
    return () => {
      answerArray[q] = a;
      for (let i = 0; i < qas[q]['answers'].length; i++) {
        $(`#answer${q}-${i}`).css('background-color', i == a ? '#555' : '#fff');
        $(`#answer${q}-${i}`).css('color', i == a ? '#fff' : '#555');
      }
      calcpass(true);
    };
  };
  
  const editfunc = (q: number, a: number) => { // q番目の質問のa番目の選択肢を編集したとき呼ばれる関数
    return () => {
      curq = q;
      cura = a;
      qas[q]['answers'][a] = $(`#answer${q}-${a}`).val();
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
    const aspan = $('<span class="answer">');
    const input = $('<input type="text" autocomplete="off" class="answer">')
      .val(qas[q]['answers'][a])
      .attr('id', `answer${q}-${a}`)
      .css('background-color', a == 0 ? '#555' : '#fff')
      .css('color', a == 0 ? '#fff' : '#555')
      .on('click', selfunc(q, a))
      .on('keyup', editfunc(q, a));
    aspan.append(input);
    return aspan;
  };
  
  const showimage = (str: string, img: JQuery) => {
    if (str.match(/\.(png|jpeg|jpg|gif)$/i)) {
      img.attr('src', str)
        .css('display', 'block');
    } else {
      img.css('display', 'none');
    }
  };
  
  const qeditfunc = (q: number) => { // q番目の問題を編集したとき呼ばれる関数
    return () => {
      const str = $(`#question${q}`).val() as string;
      qas[q]['question'] = str;
      const img = $(`#image${q}`);
      showimage(str, img);
      calcpass();
    };
  };
  
  const minusfunc = (q: number) => { // q番目の問題の「-」ボタンを押したとき呼ばれる関数
    return () => {
      qas[q]['answers'].pop();
      $(`#answer${q}-${qas[q]['answers'].length}`).remove();
    };
  };
  
  const plusfunc = (q: number) => { // q番目の問題の「+」ボタンを押したとき呼ばれる関数
    return () => {
      const nelements = qas[q]['answers'].length;
      qas[q]['answers'].push('新しい回答例');
      $(`#delim${q}`).before(answerspan(q, nelements));
    };
  };
  
  const qadiv = (q: number) => { // q番目の質問+選択肢のdiv
    answerArray[q] = 0;
    const div = $("<div class='qadiv'>")
      .attr('id', `qadiv${q}`);
    const qdiv = $('<div width="100%" class="qdiv">');
    const qstr = qas[q]['question'];
    const qinput = $('<input type="text" autocomplete="off" class="qinput">')
      .attr('id', `question${q}`)
      .val(qstr)
      .on('keyup', qeditfunc(q));
    qdiv.append(qinput);
    div.append(qdiv);
      
    const img = $("<img class='qimg'>")
      .attr('id', `image${q}`);
    div.append(img);
    showimage(qstr, img);
      
    const ansdiv = $("<div class='ansdiv'>");
    for (let i = 0; i < qas[q]['answers'].length; i++) {
      ansdiv.append(answerspan(q, i));
    }
    const delim = $('<span>  </span>')
      .attr('id', `delim${q}`);
    ansdiv.append(delim);

    div.append(ansdiv)
      .append($('<br clear="all">'));
    
    return div;
  };
  
  const maindiv = () => {
    $("#main").children().remove(); // ブラウザから「別名で保存」すると #main に入れたデータが全部格納されてしまうので、最初に全部消しておく
  
    for (let i = 0; i < qas.length; i++) {
      $("#main").append(qadiv(i));
    }
  };
  
  const secretstr = (): string => { // 質問文字列と選択された文字列をすべて接続した文字列
    return Array.from({ length: qas.length }, (_, i) => {
      return qas[i]['question'] + qas[i]['answers'][answerArray[i]];
    }).join('');
  };
  
  const calcpass = (copy?: boolean) => { // シード文字列からパスワード文字列を生成
    const newpass = crypt($('#seed').val() as string, secretstr());
    $('#pass').val(newpass);
  };
  
  const calcseed = () => { // パスワード文字列からシード文字列を生成
    const newseed = crypt($('#pass').val() as string, secretstr());
    $('#seed').val(newseed);
    data['seed'] = newseed;
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
            const json = m[1].replace(/;.*$/, '');
            data = JSON.parse(json);
          }
        });
      }
      const qas = data['qas'];
      const seed = data['seed'];

      globaldata['qas'] = data['qas'];
      globaldata['seed'] = data['seed'];

      questions = [];
      for (let i = 0; i < qas.length; i++) {
        questions.push(qas[i]['question']);
      }
      answers = qas[0]['answers'];
      
      $('#seed').val(seed);
      $("#main").children().remove();
      maindiv();
      calcpass();
    };
    fileReader.readAsText(file);
  };
  
  const init = () => {
    lib.show('#editor');
    lib.make_html(data);

    //
    // seedかパスワードを編集したら相手を変更
    //
    $('#seed').keyup((e) => {
      data['seed'] = $('#seed').val();
      calcpass();
    });
    $('#pass').keyup((e) => {
      calcseed();
    });

    $('#seed').val(data.seed);

    // Drag&Drop対応
    $('body')
      .bind("dragover", (e) => {
        return false;
      })
      .bind("dragend", (e) => {
        return false;
      })
      .bind("drop", (e) => {
        e.preventDefault(); // デフォルトは「ファイルを開く」
        const files = (e.originalEvent as DragEvent).dataTransfer?.files;
        if (files) sendfile(files);
        return files;
      });

    maindiv();
    calcpass();
  };

  init();
}

export function answer(): number[] {
  return answerArray;
}
