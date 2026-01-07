<h1>EpisoPass2023</h1>

<h2>Build and Run</h2>

<pre><code>deno task build  # Bundle TypeScript files to dist/bundle.js
deno task serve  # Start local file server
</code></pre>

<h2>About</h2>

<ul>
  <li><a href="https://GitHub.com/masui/EpisoPass2021">EpisoPass2021</a>を若干改良</li>
  <li>問題データベースの編集/セーブもHTMLで実行</li>
  <li><code>deno task build</code>でTypeScriptをバンドル
  <li>GitHub Pagesで運用</li>
  <li>Cypressによるテストができる</li>
  <li>問題データベースと回答数を引数に指定できるようにした</li>
</ul>

<h3>TODO</h3>

<ul>
  <li>pushstate利用して「戻る」を有効に</li>
</ul>

