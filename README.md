## Whatsapp Bot With Some Unique Features but it can running with termux
[whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
![Fork](https://img.shields.io/github/forks/mhankbarbar/termux-whatsapp-bot?style=social)


This is a bot , sure this is a bot ! 

## Getting Started

This project require MQTT broker, nodeJS v10.22.0

### Install

make sure u have installed ubuntu 18.04 in your termux , if you aren't install it 
go install
```zsh
> pkg install proot-distro && proot-distro install ubuntu-18.04
```

then ..
Install chromium browser
```zsh
> apt-get sudo && sudo apt-get install chromium-browser && mv /usr/bin/chromium-browser /usr/bin/chromium
```

Clone this project

```zsh
> git clone https://github.com/mhankbarbar/termux-whatsapp-bot
> cd termux-whatsapp-bot

```

Install the dependencies:

```zsh
> npm i
```



### Usage
run the Whatsapp bot

```zsh
> npm start
```

after running it you need to scan the qr

### Features
Type <b>!menu</b> or <b>!help</b> for show feature

Feature | Status |
| -------------- | ------------- |
| Instagram download | Oke |
| WhatsAnime | Oke |
| Brainly | Oke |
| Text to speech | Oke |
| Nhentai | Oke |
| Horoscope menu | Oke |
| ytmp3 download | Oke |
| And | Others |

### Owner Commands
( Only owner group! )

› `!promote`: Menaikkan pangkat member menjadi admin<br>
› `!demote`: Menurunkan pangkat admin menjadi member<br>
› `!kick`: Mengeluarkan member group<br>
› `!add`: Menambahkan member group<br>
› `!desk`: Mengubah desc group<br>
› `!subject`: Mengubah title group
