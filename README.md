# CASL2 Playground

https://bati11.github.io/casl2-playground/

CASL2 Playgoundは、基本情報技術者試験のために策定されたアセンブラ言語CASL2を、Webブラウザで書いて実行できるWebサービスです。

## Build

COMMET2とCASL2アセンブラ
```
$ cd <PROJECT_ROOT>/casl2
$ npm build # output to <PROJECT_ROOT>/web/lib/
```

Web UI
```
$ cd <PROJECT_ROOT>/web
$ npm run build
$ npm run start # run local dev server (localhost:8080)
```
