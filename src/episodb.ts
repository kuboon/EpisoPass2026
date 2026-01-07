import $ from './jquery.js';
import { lib } from './lib.js';

declare const db: any;
declare let questions: string[];
declare let answers: string[];
declare let data: any;
declare const nquestions: number;

export function episodb(): void {
    function init(): void {
	lib.show('#episodb');

	$('#descbuttondiv').css('background', '#555');
	$('#episodbbuttondiv').css('background', '#999');
	$('#editbuttondiv').css('background', '#555');

	リスト表示({ リスト: answers, フォームid: 'answers', クラス: 'answerinput', 改行あり: false });
	リスト表示({ リスト: questions, フォームid: 'questions', クラス: 'questioninput', 改行あり: true });
    }
    init();
}

function n個目の答を削除する関数(n: number, 属性: any): () => void {
    return function() {
	属性.リスト.splice(n, 1);
	リスト表示(属性);
    };
}

function n個目の答を登録する関数(n: number, 属性: any): (e: any) => void {
    return function(e: any) {
	属性.リスト[n] = e.target.value;
	リスト表示(属性);
    };
}

function 重複と空エントリを削除(リスト: string[]): void {
    const 新リスト: string[] = [];
    for (let i = 0; i < リスト.length; i++) {
	const 項目 = リスト[i];
	if (項目 != '' && !新リスト.includes(項目)) {
	    新リスト.push(項目);
	}
    }
    リスト.length = 0; // 配列を削除
    for (let i = 0; i < 新リスト.length; i++) {
	リスト[i] = 新リスト[i];
    }
}

export function リスト表示(属性: any): void {
    重複と空エントリを削除(属性.リスト);
    const フォーム = $('#' + 属性.フォームid);
    フォーム.children().remove();

    EpisoPassデータ作成();
    
    let i: number;
    for (i = 0; i < 属性.リスト.length; i++) {
	const エントリ = $('<span>');
	
	$('<input>')
	    .attr('type', 'text')
	    .attr('class', 属性.クラス)
	    .attr('id', `name${i}`)
	    .val(属性.リスト[i])
	    .appendTo(エントリ)
	    .on('change', n個目の答を登録する関数(i, 属性));

	$('<span>')
	    .text('✖')
	    .attr('class', 'check')
	    .on('click', n個目の答を削除する関数(i, 属性))
	    .appendTo(エントリ);
	
	フォーム.append(エントリ);
	
	if (属性.改行あり) {
	    フォーム.append($('<br/>'));
	}
    }
    
    const エントリ = $('<span>');
    
    $('<input>')
        .attr('type', 'text')
        .attr('class', 属性.クラス)
        .attr('placeholder', '(追加)')
	.focus()
	.appendTo(エントリ)
        .on('change', n個目の答を登録する関数(i, 属性));
    
    フォーム.append(エントリ);
}

export function ランダムに回答を追加(リスト: string[]): void {
    const 未登録のリスト = リスト.filter(item => !answers.includes(item));
    const 未登録のデータの数 = 未登録のリスト.length;
    if (未登録のデータの数 == 0) return;
    const 新たに登録するデータ = 未登録のリスト[Math.floor(Math.random() * 未登録のデータの数)];
    answers.push(新たに登録するデータ);
    リスト表示({ リスト: answers, フォームid: 'answers', クラス: 'answerinput', 改行あり: false });
}

export function ランダムに問題を追加(): void {
    const 未登録のリスト = db.問題例リスト.filter((item: string) => !questions.includes(item));
    const 未登録のデータの数 = 未登録のリスト.length;
    if (未登録のデータの数 == 0) return;
    const 新たに登録するデータ = 未登録のリスト[Math.floor(Math.random() * 未登録のデータの数)];
    questions.push(新たに登録するデータ);
    リスト表示({ リスト: questions, フォームid: 'questions', クラス: 'questioninput', 改行あり: true });
}

function 重みづけ都市選択(): string {
    // 人口の多い都市ほど選ばれやすくする
    let 総人口 = 0;
    for (let i = 0; i < db.都市リスト.length; i++) {
	総人口 += db.都市リスト[i][1];
    }
    const 何人目か = Math.floor(Math.random() * 総人口);
    let 人口総和 = 0;
    for (let i = 0; i < db.都市リスト.length; i++) {
	人口総和 += db.都市リスト[i][1];
	if (人口総和 > 何人目か) {
	    return db.都市リスト[i][0];
	}
    }
    return '横浜';
}

export function 重みづけランダムに都市を追加(): void {
    let 都市: string;
    for (let i = 0; i < 1000; i++) {
	都市 = 重みづけ都市選択();
	if (!answers.includes(都市)) {
	    answers.push(都市);
	    リスト表示({ リスト: answers, フォームid: 'answers', クラス: 'answerinput', 改行あり: false });
	    break;
	}
    }
}

function JSONデータ(): string {
    let s = "{\n";
    s += "  \"questions\": [\n";
    for (let i = 0; i < questions.length; i++) {
	s += "    \"" + questions[i].replace(/"/g, '\\"') + "\"";
	if (i < questions.length - 1) s += ",";
	s += "\n";
    }
    s += "  ],\n  \"answers\": [\n";
    for (let i = 0; i < answers.length; i++) {
	s += "    \"" + answers[i].replace(/"/g, '\\"') + "\"";
	if (i < answers.length - 1) s += ",";
	s += "\n";
    }
    s += "  ]\n}\n";
    return s;
}

export function JSONデータセーブ(): void {
    const blob = new Blob([JSONデータ()], { type: 'text/json' });
    const url = URL.createObjectURL(blob);
    const a = $('<a>')
	  .attr('href', url)
	  .attr('download', 'episopass.json');
    (a[0] as HTMLElement).click(); // jQueryの場合こういう処理が必要
}

export function JSONデータロード(): void {
    console.log('getjson()');
    const file = document.querySelector('#fileload') as HTMLInputElement;
    file.onchange = function() {
	console.log('onchange');
	const fileList = file.files;
	if (!fileList) return;
        const reader = new FileReader();
        reader.readAsText(fileList[0]);
        reader.onload = function() {
	    const data = $.parseJSON(reader.result as string);
	    questions = data['questions'];
	    answers = data['answers'];
	    リスト表示({ リスト: answers, フォームid: 'answers', クラス: 'answerinput', 改行あり: false });
	    リスト表示({ リスト: questions, フォームid: 'questions', クラス: 'questioninput', 改行あり: true });
	    
	    // データの再ロードを可能にする
	    // https://qiita.com/_Keitaro_/items/57b1c5dd36b7bed08ad8
	    $('#fileload').val('');
        };
    };
}

export function データシャッフル(リスト: any[]): void {
    const len = リスト.length;
    for (let i = 0; i < len; i++) {
	const n = Math.floor(Math.random() * (len - i));
	const tmp = リスト[i];
	リスト[i] = リスト[len - n - 1];
	リスト[len - n - 1] = tmp;
    }
}

export function EpisoPassデータ作成(): void {
    const 問題数 = questions.length;
    const リスト: string[] = [];
    for (let i = 0; i < 問題数; i++) {
	リスト[i] = questions[i];
    }
    let 最大問題数 = 問題数;
    if (最大問題数 > nquestions) {
	データシャッフル(リスト);
	最大問題数 = nquestions;
    }

    const qas = [];
    for (let i = 0; i < 最大問題数; i++) {
	const o: any = {};
	o["question"] = リスト[i];
	o["answers"] = answers;
	qas.push(o);
    }
    data.qas = qas;

    // localStorageに問題データベースを格納
    localStorage.setItem('EpisoDB', JSONデータ());
}
