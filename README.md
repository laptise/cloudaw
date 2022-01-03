# Cloudaw

インターネットブラウザ上で実行される DAW(音楽制作ソフト)。多人数で協業で使われることを目的としている

### 音楽を仲間と協業しながらで作ろう

- リアルタイムで仲間の作業内容が確認できる
- チャットや音声会話機能を使ってリアルタイムで意思疎通しあう

### インストールやハードディスクは不要

- オンブラウザで完結する DAW
- 音源ファイルはサーバー上に保存される

### サードパーティプラグインの著作権を守る

- オンライン駆動の頂点を活かし、安全なプラグインのエコシステムを構築
- Audio Worklet 技術をもっと簡単に開発できるようにサポート

# Dev

### 技術スタック

- [Next.js](https://nextjs.org/) ([React.js](https://reactjs.org/))
- [Type Script](https://www.typescriptlang.org/)
- [Web Audio Api](https://www.w3.org/TR/webaudio/)
- Audio Worklet, Audio Worklet Processor

Cloudaw は Next.js, Firebase の環境で動作しています。

実行には以下のコマンドを入力します

```bash
npm run dev
# or
yarn dev
```

Firebase の環境変数がないと正しく実行されないはずなので[このリンク](http://cloudaw.vercel.app/)からデモを確認してください。

# 参考資料

- [Web Audio Api](https://www.w3.org/TR/webaudio/)
- [Web AUdio Api 和訳](https://g200kg.github.io/web-audio-api-ja/)
- [Enter Audio Worklet](https://developers.google.com/web/updates/2017/12/audio-worklet)
- [Web Audio Samples](https://googlechromelabs.github.io/web-audio-samples/)
