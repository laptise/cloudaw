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

---

## ゴール

- 多数のユーザーが同じワークスペース上で作業をする
- 他のユーザーが現在何をしているか分かるようにする
- ユーザー同士が同じレコーディングブースにいるかのように意思疎通できるようにする
- サードパーティのプラグイン・楽器製作者が Cloudaw 上でユーザーにプラグインを販売または提供できるようにする。

---

## 技術スタック

- [Next.js](https://nextjs.org/) ([React.js](https://reactjs.org/))
- [Type Script](https://www.typescriptlang.org/)
- [Web Audio Api](https://www.w3.org/TR/webaudio/)
- Audio Worklet, Audio Worklet Processor

### FireBase

リアルタイムで他ユーザーとの相互作用をするために FireBase FireStore を利用

### 状態管理

Cloudaw は Next.js, Firebase の環境で動作しています。

状態管理には、Redux ではなく React Hooks の UseContext を使っています。

### 実行

以下のコマンドを入力

```bash
npm run dev
# or
yarn dev
```

Firebase の環境変数がないと正しく実行されないはずなので[このリンク](http://cloudaw.vercel.app/)からデモを確認してください。

---

## 参考ドキュメント

- [Web Audio Api](https://www.w3.org/TR/webaudio/)
- [Web AUdio Api 和訳](https://g200kg.github.io/web-audio-api-ja/)
- [Enter Audio Worklet](https://developers.google.com/web/updates/2017/12/audio-worklet)
- [Web Audio Samples](https://googlechromelabs.github.io/web-audio-samples/)

---

## 類似サービス

### [Logic Pro](https://www.apple.com/jp/logic-pro/)

Apple 製 DAW ソフトウェア

### [Amped Studio](https://ampedstudio.com/)

ブラウザ DAW。コラボレーション機能は弱いがユーザーが持つ VST 利用できるようにする試みがある

### [Sound Trap](https://www.soundtrap.com/) - コラボレーション + ブラウザ DAW (最大手＆多機能)
