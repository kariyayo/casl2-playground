# CASL2 Playground

https://bati11.github.io/casl2-playground/

CASL2 Playgoundは、基本情報技術者試験のために策定されたアセンブラ言語CASL2を、Webブラウザ上で書いて実行できるWebサービスです。

v0.1.0時点でマクロ命令はサポートできていません。

<img src="https://github.com/bati11/casl2-playground/raw/main/sample_image.png" width="480px" style="border: solid 1px lightgray">

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
