import $ from './jquery.js';
import { lib } from './lib.js';
import { editor } from './editor.js';

export function easy(): void {
    function shuffle(array: any[], n: number): void {
	for (let i = 0; i < n; i++) {
            const r = i + 1 + Math.floor(Math.random() * (array.length - i - 1));
            const tmp = array[i];
            array[i] = array[r];
            array[r] = tmp;
	}
    }

    function init(): void {
	lib.show('#easy');

	$('body').on('click', () => {
            $('#easyanswers').css('height', '80px');
            $('#easyquestions').css('height', '80px');
	});
	$('#easyanswers').on('click', () => {
            $('#easyanswers').css('height', '300px');
            $('#easyquestions').css('height', '80px');
	    return false;
	});
	$('#easyquestions').on('click', () => {
            $('#easyquestions').css('height', '300px');
	});
	$('#easyquestions').on('click', () => {
            $('#easyquestions').css('height', '300px');
            $('#easyanswers').css('height', '80px');
	    return false;
	});

	$('#startedit').click(function() {
            let data: any = {};
            data['seed'] = "SampleSeed12345";
            const answersVal = ($('#easyanswers').val() as string).split(/\n+/);
            const answers = $.grep(answersVal, function(s: string, i: number) {
		return s != "";
            }) as string[];
            if (answers.length == 0) {
		alert("名前リストを入力して下さい");
		return;
            }
            const qsVal = ($('#easyquestions').val() as string).split(/\n+/);
            const qs = $.grep(qsVal, function(s: string, i: number) {
		return s != "";
            }) as string[];
            if (qs.length == 0) {
		alert("質問リストを入力して下さい");
		return;
            }
	    
            const qas = [];
            for (let i = 0; i < qs.length; i++) {
		const qa: any = {};
		qa['question'] = qs[i];
		qa['answers'] = answers;
		qas.push(qa);
            }
            data['qas'] = qas;
	    data['name'] = 'easy';
	    data['seed'] = "SampleSeed12345";
	    
	    editor(data);
	});

	const pair = location.search.substring(1).split('&');
	for (let i = 0; pair[i]; i++) {
	    const kv = pair[i].split('=');
	    if (kv[0] == 'questions') {
		$('#easyquestions').val(decodeURIComponent(kv[1]).split(/;/).join("\n"));
	    }
	    if (kv[0] == 'answers') {
		$('#easyanswers').val(decodeURIComponent(kv[1]).split(/;/).join("\n"));
	    }
	}
    }

    init();
}
