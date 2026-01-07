//
// ライブラリのTS
// lib.make_html() が使える
// lib.show() が使える
//

import $ from './jquery.ts';

declare const dastemplate: { dastemplate: string };

export const lib = {
    make_html: function(data: any): void {
	// https://qiita.com/daiiz/items/9b9eddb5de9246b017bc daiizOA
	// これでHTML取得リンクができる
	const a = $('#htmlbutton');
	a.attr('download', 'RunEpisoPass.html');

	const lines = dastemplate.dastemplate.split(/\n/);
	for (let i = 0; i < lines.length; i++) {
	    if (lines[i].match(/REPLACE_THIS_LINE$/)) {
		lines[i] = `const data = ${JSON.stringify(data)}`;
	    }
	}
	const html = lines.join("\n");
	
	const blob = new Blob([html], { type: "text/html" });
	const url = URL.createObjectURL(blob);
	a.attr('href', url);
    },
    
    show: function(id: string): void {
	$('#contents').children().css('display', 'none');
	$(id).css('display', 'block');
    }
};
