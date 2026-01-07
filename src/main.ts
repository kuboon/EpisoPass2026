//
// EpisoPassの入口
//

import $ from "./jquery.ts";
import { editor, answer } from "./editor.ts";
import { crypt } from "./crypt.ts";
import { lib } from "./lib.ts";
import { episodb, EpisoPassデータ作成 } from "./episodb.ts";
import sampledb from "./sampledb.json" with { type: "json" };

// これらは ERB で生成されるファイルから来る (現時点では declare で対応)
declare const dasmaker: any;
declare const dastemplate: any;

// グローバル変数として宣言 (他のモジュールからアクセスされる)
(window as any).data = { // EpisoPass問題で利用されるデータ
    "name": "EpisoPass",
    "seed": "EpisoPass_123456",
    "qas": [] // 問題ごとに回答を変えられるようにしてた時代のなごり
};

(window as any).db = sampledb; // サンプルデータなど

// 引数解析
const args: { [key: string]: string } = {};
(window as any).questions = sampledb.サンプル問題リスト;
(window as any).answers = sampledb.サンプル回答リスト;
(window as any).nquestions = 10;

document.location.search.substring(1).split('&').forEach((s) => {
    const parts = s.split('=');
    if (parts.length === 2) {
        const [name, value] = parts;
        args[name] = decodeURIComponent(value);
    }
});

const main = async function(): Promise<void> {
    const data = (window as any).data;
    let questions = (window as any).questions;
    let answers = (window as any).answers;
    let nquestions = (window as any).nquestions;

    if (args['n']) {
	nquestions = Number(args['n']);
	(window as any).nquestions = nquestions;
    }
	
    if (args['data']) { // WebからJSONデータを取得
	await fetch(args['data'])
	    .then((response) => response.json())
	    .then((fetchedData) => {
		questions = fetchedData.questions;
		answers = fetchedData.answers;
		(window as any).questions = questions;
		(window as any).answers = answers;
	    });
    }
    else if (args['questions']) {
	questions = decodeURIComponent(args['questions']).split(/;/);
	answers = decodeURIComponent(args['answers']).split(/;/);
	(window as any).questions = questions;
	(window as any).answers = answers;
    }
    else {
	// localStorageに問題データベースがあれば取得 (前回のデータが使われる)
	const localdbstr = localStorage.getItem('EpisoDB');
	if (localdbstr) {
	    const localdb = JSON.parse(localdbstr);
	    questions = localdb.questions;
	    answers = localdb.answers;
	    (window as any).questions = questions;
	    (window as any).answers = answers;
	}
    }

    // ボタンの挙動設定
    $("#descbutton").click(() => {
	lib.show('#description');
	$('#descbuttondiv').css('background', '#999');
	$('#episodbbuttondiv').css('background', '#555');
	$('#editbuttondiv').css('background', '#555');
	$('#dasbuttondiv').css('background', '#555');
	$('#dasbutton').css('display', 'none');
    });
    $("#episodbbutton").click(() => {
	episodb();
    });
    $("#editbutton").click(() => editor());
    $("#dasbutton").off(); // 何度も登録されて困った
    $("#dasbutton").click(() => dasmaker.dasmaker(data, answer()));
    
    EpisoPassデータ作成();
    
    const qas = [];
    let maxlen = questions.length;
    if (maxlen > nquestions) maxlen = nquestions;
    for (let i = 0; i < maxlen; i++) {
	const obj: any = {};
	obj['question'] = questions[i];
	obj['answers'] = answers;
	qas.push(obj);
    }
    data['qas'] = qas;
    
    if (args['questions']) {
	editor(data); // 回答画面へ
    }
    else if (args['data']) {
	episodb(); // データベース編集画面へ
    }
    else {
	lib.show('#description');
	$('#descbuttondiv').css('background', '#999');
	$('#episodbbuttondiv').css('background', '#555');
	$('#editbuttondiv').css('background', '#555');
	$('#dasbuttondiv').css('background', '#555');
	$('#dasbutton').css('display', 'none');
    }
};

main();
