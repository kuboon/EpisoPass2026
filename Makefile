.PHONY: test

# all: compile dasmaker episodas template index pack embed scp cp
all: dasmaker episodas template index pack embed cp

allcp: dasmaker episodas template index pack embed scp cp

install:
	npm install
pack:
	npm run build

embed:
	-/bin/rm -f dist/episopass.html
	ruby bin/embed.rb src/index.html > dist/episopass.html
	chmod 444 dist/episopass.html

index:
	-/bin/rm -f src/index.html
	erb src/index.html.erb > src/index.html
	chmod 444 src/index.html

dasmaker:
	-/bin/rm -f src/dasmaker.js
	erb src/dasmaker.js.erb > src/dasmaker.js
	chmod 444 src/dasmaker.js

episodas:
	-/bin/rm -f src/episodas.js
	erb src/episodas.js.erb > src/episodas.js
	chmod 444 src/episodas.js

# episodas.erb, sampledata.json から dastemplate.js をつくる
template: src/episodas.html.erb src/sampledata.json
	-/bin/rm -f src/dastemplate.js
	ruby bin/dastemplate.rb > src/dastemplate.js
	chmod 444 src/dastemplate.js

clean:
	-/bin/rm -f dist/bundle.js
	-/bin/rm -f src/dasmaker.js
	-/bin/rm -f src/episodas.js
	-/bin/rm -f src/dastemplate.js
	-/bin/rm -f *~
	-/bin/rm -f .gitignore~
	-/bin/rm -f */*~
	cd test; make clean
	cd test-jest; make clean

scp:
	scp dist/episopass.html pitecan.com:/www/www.pitecan.com/tmp
	scp dist/episopass.html pitecan.com:/www/www.pitecan.com/tmp/EpisoPass.html

cp:
	cp dist/episopass.html index.html

# Cypressによるテスト
test:
	cd test; make

# Jestによるテスト
testjest:
	cd test-jest; make

