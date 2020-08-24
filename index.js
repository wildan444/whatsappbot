const fs = require("fs");
const { tz } = require("moment-timezone");
const qrcode = require("qrcode-terminal");
const { Client, MessageMedia } = require("whatsapp-web.js");
const { DownloaderHelper } = require("node-downloader-helper")
const mqtt = require("mqtt");
const listen = mqtt.connect("mqtt://test.mosquitto.org");
const fetch = require("node-fetch");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const SESSION_FILE_PATH = "./session.json";
// file is included here
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}
client = new Client({

	    puppeteer: {
        executablePath: '/usr/bin/chromium',
        headless: true,
		args: [
      "--log-level=3", // fatal only

      "--no-default-browser-check",
      "--disable-infobars",
      "--disable-web-security",
      "--disable-site-isolation-trials",
      "--no-experiments",
      "--ignore-gpu-blacklist",
      "--ignore-certificate-errors",
      "--ignore-certificate-errors-spki-list",

      "--disable-extensions",
      "--disable-default-apps",
      "--enable-features=NetworkService",
      "--disable-setuid-sandbox",
      "--no-sandbox",

      "--no-first-run",
      "--no-zygote"
    ]

    },
    session: sessionCfg
});
// You can use an existing session and avoid scanning a QR code by adding a "session" object to the client options.

client.initialize();

// ======================= Begin initialize WAbot

client.on("qr", qr => {
	// NOTE: This event will not be fired if a session is specified.
	const time = `[ ${tz('Asia/Jakarta').format('LTS')} ]`
	qrcode.generate(qr, {
		small: true
	});
	console.log(col(time),col("Please Scan QR with app!", "kuning"));
});

client.on("authenticated", session => {
	const time = `[ ${tz('Asia/Jakarta').format('LTS')} ]`
	console.log(col(time), col("Authenticated Success!","ijo"));
	// console.log(session);
	sessionCfg = session;
	fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
		if (err) {
			console.error(err);
		}
	});
});

client.on("auth_failure", msg => {
	// Fired if session restore was unsuccessfull
	const time = `[ ${tz('Asia/Jakarta').format('LTS')} ]`
	console.log(col(time), col(" AUTHENTICATION FAILURE\n","merah"), col(msg))
	fs.unlink("./session.json", function(err) {
		if (err) return console.log(err);
		console.log(col(time), col(" Session Deleted, Please Restart!","merah"));
		process.exit(1);
	});
});

client.on("ready", () => {
	const time = `[ ${tz('Asia/Jakarta').format('LTS')} ]`
	console.log(col(time), col("Whatsapp bot ready!","ijo"));
});

// ======================= Begin initialize mqtt broker

listen.on("connect", () => {
	const time = `[ ${tz('Asia/Jakarta').format('LTS')} ]`
	listen.subscribe("corona", function(err) {
		if (!err) {
			console.log(col(time), col("Mqtt topic subscribed!","ijo"));
		}
	});
});

// ======================= WaBot Listen on Event

client.on("message_create", msg => {
	// Fired on all message creations, including your own
	if (msg.fromMe) {
    // do stuff here
	}
});

client.on("message_revoke_everyone", async (after, before) => {
	// Fired whenever a message is deleted by anyone (including you)
	// console.log(after); // message after it was deleted.
	if (before) {
		console.log(before.body); // message before it was deleted.
	}
});

client.on("message_revoke_me", async msg => {
	// Fired whenever a message is only deleted in your own view.
	// console.log(msg.body); // message before it was deleted.
});

client.on("message_ack", (msg, ack) => {
  /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

	if (ack == 3) {
    // The message was read
	}
});
client.on('group_join', async (notification) => {
	// User has joined or been added to the group. 
    console.log('join', notification);
    const botno = notification.chatId.split('@')[0];
    let number = await notification.id.remote;
    //client.sendMessage(number, `Hai , selamat datang di group ini`);
    const chats = await client.getChats();
    for (i in chats) {
        if (number == chats[i].id._serialized) {
            chat = chats[i];
        }
    }
    var participants = {};
    var admins = {};
    var i;
    for (let participant of chat.participants) {
        if (participant.id.user == botno) { continue; }
        //participants.push(participant.id.user);
        const contact = await client.getContactById(participant.id._serialized);
        participants[contact.pushname] = participant.id.user;
        // participant needs to send a message for it to be defined
        if (participant.isAdmin) {
            //admins.push(participant.id.user);
            admins[contact.pushname] = participant.id.user;
            //client.sendMessage(participant.id._serialized, 'Hai admin, ada member baru di group mu');
            //const media = MessageMedia.fromFilePath('./test/test.pdf');
            //client.sendMessage(participant.id._serialized, media);
        }
    }
    /*console.log('Group Details');
    console.log('Name: ', chat.name);
    console.log('Participants: ', participants);
    console.log('Admins: ', admins);
    notification.reply('User joined.'); // sends message to self*/
});

client.on('group_leave', async (notification) => {
    // User has joined or been added to the group.
    console.log('leave', notification);
    const botno = notification.chatId.split('@')[0];
    let number = await notification.id.remote;
    //client.sendMessage(number, `Selamat tinggal kawan`);

    const chats = await client.getChats();
    for (i in chats) {
        if (number == chats[i].id._serialized) {
            chat = chats[i];
        }
    }
    var participants = {};
    var admins = {};
    var i;
    for (let participant of chat.participants) {
        if (participant.id.user == botno) { continue; }
        //participants.push(participant.id.user);
        const contact = await client.getContactById(participant.id._serialized);
        participants[contact.pushname] = participant.id.user;
        // participant needs to send a message for it to be defined
        if (participant.isAdmin) {
            //admins.push(participant.id.user);
            admins[contact.pushname] = participant.id.user;
            //client.sendMessage(participant.id._serialized, 'Hai admin, ada member yang keluar di group mu');
  //          const media = MessageMedia.fromFilePath('./test/test.pdf');
            //client.sendMessage(participant.id._serialized, media);
        }
    }
    console.log('Group Details');
    console.log('Name: ', chat.name);
    console.log('Participants: ', participants);
    console.log('Admins: ', admins);
    //notification.reply('User out.'); // sends message to self
});

client.on("group_update", notification => {
	// Group picture, subject or description has been updated.
	console.log("update", notification);
});

client.on("disconnected", reason => {
	console.log("Client was logged out", reason);
});

client.on('change_battery', (batteryInfo) => {
	const { battery, plugged } = batteryInfo;
	console.log(col(time), col("Battery : ","kuning"), col(battery), col("- Charging ?","kuning"), col(plugged))
});

// ======================= WaBot Listen on message

client.on("message", async msg => {
    // console.log('MESSAGE RECEIVED', msg);
    const time = `[ ${tz('Asia/Jakarta').format('LTS')} ]`
    const chat = await msg.getChat();
    const users = await msg.getContact()
    const dariGC = msg['author']
    const dariPC = msg['from']
	console.log(col(time), col("Message:","ijo"),
	msg.from.split('@')[0],
	col("|","ijo"), msg.type, col("|","ijo"),
	msg.body ? msg.body : ""
	)
const botTol = () => {
        msg.reply('[!] Maaf, fitur ini hanya untuk admin(owner).')
        return
    }
const botTol2 = () => {
        msg.reply(`[!] Maaf, fitur ini hanya untuk 'Group Chat'.`)
        return
    }

    if (msg.body.startsWith('!subject ')) {
        if (chat.isGroup) {
            if (dariGC.replace('@c.us', '') == chat.owner.user || dariGC.replace('@c.us','') == '6285892766102') {
                let title = msg.body.slice(9)
                chat.setSubject(title)
            } else {
                botTol()
            }
        } else {
            botTol2()
        }
    } else if (msg.body === '!getall') {
        const chat = await msg.getChat();

        let text = "╭───「 Get All 」\n";
        let mentions = [];

        for(let participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);

            mentions.push(contact);
			text += "├≽ ";
            text += `@${participant.id.user} `;
			text += "\n";
        }
	text += "╰───「 Success 」"
        chat.sendMessage(text, { mentions });
    } else if (msg.body.startsWith('!deskripsi ')) {
        if (chat.isGroup) {
            if (dariGC.replace('@c.us', '') == chat.owner.user || dariGC.replace('@c.us','') == '6285892766102') {
                let title = msg.body.split("!deskripsi ")[1]
                chat.setDescription(title)
            } else {
                botTol()
            }
        } else {
            botTol2()
        }
    } else if (msg.body.startsWith('!promote ')) {
        if (chat.isGroup) {
            if (dariGC.replace('@c.us', '') == chat.owner.user || dariGC.replace('@c.us','') == '6285892766102') {
                const contact = await msg.getContact();
                const title = msg.mentionedIds[0]
                chat.promoteParticipants([`${title}`])
                //chat.sendMessage(`[:] @${title.replace('@c.us', '')} sekarang anda adalah admin sob 🔥`)
            } else {
                botTol()
            }
        } else {
            botTol2()
        }
    } else if (msg.body.startsWith('!demote ')) {
        if (chat.isGroup) {
            if (dariGC.replace('@c.us', '') == chat.owner.user || dariGC.replace('@c.us','') == '6285892766102') {
                let title = msg.mentionedIds[0]
                chat.demoteParticipants([`${title}`])
            } else {
                botTol()
            }
        } else {
            botTol2()
        }
    } else if (msg.body.startsWith('!add ')) {
        if (chat.isGroup) {
            if (dariGC.replace('@c.us', '') == chat.owner.user || dariGC.replace('@c.us','') == '6285892766102' || dariGC.replace('@c.us','') == '19197694653') {
                let title = msg.body.slice(5)
                if (title.indexOf('62') == -1) {
                    chat.addParticipants([`${title.replace('0', '62')}@c.us`])
                    //msg.reply(`[:] Selamat datang @${title}! jangan lupa baca Deskripsi group yah 😎👊🏻`)
                } else {
                    msg.reply('[:] Format nomor harus 0821xxxxxx')
                }
            } else {
                botTol()
            }
        } else {
            botTol2()
        }
    } else if (msg.body.startsWith('!kick ')) {
        if (chat.isGroup) {
            if (dariGC.replace('@c.us', '') == chat.owner.user || dariGC.replace('@c.us','') == '6285892766102' || dariGC.replace('@c.us','') == '19197694653') {
                let title = msg.mentionedIds
                    chat.removeParticipants([...title])
                // console.log([...title]);
            } else {
                botTol()
            }
        } else {
            botTol2()
        }
    } else if (msg.body == '!owner') {
        if (chat.isGroup) {
            msg.reply(JSON.stringify({
                owner: chat.owner.user
            }))
        } else {
            botTol2()
        }
    }

	if (msg.body == "!ping reply") {
    // Send a new message as a reply to the current one
		 msg.reply("pong");
	} else if (msg.body.startsWith('!covid')) {
		const get = require('got')
		const body = await get.post('https://api.kawalcorona.com/indonesia', {

		}).json();

		console.log(body[0]['name'])
		msg.reply("╭───「 COVID-19 INDONESIA 」\n├≽ Positif : " + body[0]['positif'] + "\n├≽ Sembuh : " + body[0]['sembuh'] + "\n├≽ Meninggal : " + body[0]['meninggal'] + "\n├≽ Dirawat : " + body[0]['dirawat'] + "\n╰─────────");

	} else if (msg.body.startsWith("!translate ")) {
		const translatte = require('translatte');
		var codelang = msg.body.split("[")[1].split("]")[0];
		var text = msg.body.split("]")[1];
		translatte(text, {to: codelang}).then(res => {
    		msg.reply(res.text);
			}).catch(err => {
    			msg.reply(err);
		});
	} else if (msg.body.startsWith('!bot join ')) {
        const inviteCode = msg.body.slice(10).replace('https://chat.whatsapp.com/', '')
        if (msg.body.slice(10).match(/(https:)/gi)) {
	        try {
        	    await client.acceptInvite(inviteCode);
	            msg.reply('Otw join gan');
        	} catch (e) {
	            msg.reply('Sepertinya link grup bermasalah');
        	}
		} else {
			msg.reply('Ini link? 👊🤬')
		}
    } else if (msg.body.startsWith("!lirik ")) {
		const lagu = msg.body.slice(7)
		const kyaa = lagu.replace(/ /g, '+')
		const response = await fetch('http://scrap.terhambar.com/lirik?word='+kyaa)
		if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
		const json = await response.json()
		if (json.status) await msg.reply(`Lirik lagu ${lagu.replace('-',' ')} \n\n\n${json.result.lirik}`)
	} else if (msg.body.startsWith("!bapac ")) {
		const bap = msg.body.slice(7)
		const bapac = bap.replace(/ /g, '+')
		const response = await fetch('https://api.terhambar.com/bpk?kata='+bapac)
		if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
		const json = await response.json()
		if (json.status) await msg.reply(`${json.text}`)

	} else if (msg.body.startsWith("!fb ")) {
		const request = require('request');
		var req = msg.body.split(" ")[1];
		const { exec } = require("child_process");
		var crypto = require('crypto');
		var fs = require('fs');

		var filename = 'video'+crypto.randomBytes(4).readUInt32LE(0)+'saya';
		var path = require('path');
		request.get({
  			headers: {'content-type' : 'application/x-www-form-urlencoded'},
  			url:     'https://fbdownloader.net/download/?url='+ req,
		},function(error, response, body){
    	let $ = cheerio.load(body);
   		var gehu = $('a[rel="noreferrer no-follow"]').attr('href');
		msg.reply("bentarr lagi di proses dulu ya .. 😣");
		exec('wget "' + gehu + '" -O mp4/gue.mp4', (error, stdout, stderr) => {
     	const media = MessageMedia.fromFilePath('mp4/gue.mp4');
		chat.sendMessage(media);
		if (error) {
	        console.log(`error: ${error.message}`);
        	return;
    	}
    	if (stderr) {
   	    	console.log(`stderr: ${stderr}`);
			msg.reply("yahh gagal 😭");
        	return;
    	}
	    console.log(`stdout: ${stdout}`);
		});
	});
	} else if (msg.body.startsWith('!ig ')) {
		const get = require('got')
		var param = msg.body.substring(msg.body.indexOf(' '), msg.body.length);
		const resp = await get.get('https://villahollanda.com/api.php?url='+ param).json()
		console.log(resp)
		if (resp.mediatype == 'photo') {
			var ext = '.png';
		} else {
			var ext = '.mp4';
		}
		const dl = new DownloaderHelper(resp.descriptionc, __dirname, { fileName: `./ig/${resp}${ext}` })
		console.log(dl.getStats)
		dl.on('end', () => console.log('Download completed'))
		await dl.start()
		const media = MessageMedia.fromFilePath(`./ig/${resp}${ext}`)
		await chat.sendMessage(media)
	} else if (msg.body.startsWith("!brainly ")) {
		function BrainlySearch(pertanyaan, amount,cb){
 	   		brainly(pertanyaan.toString(),Number(amount)).then(res => {

	      		let brainlyResult=[];

        		res.forEach(ask=>{
	          		let opt={
        	    		pertanyaan:ask.pertanyaan,
	            		fotoPertanyaan:ask.questionMedia,
        	  		}
	          		ask.jawaban.forEach(answer=>{
        	    		opt.jawaban={
	              		judulJawaban:answer.text,
        	      		fotoJawaban:answer.media
	            	}
        	  	})
	            	brainlyResult.push(opt)
        		})

	        	return brainlyResult

	    	}).then(x=>{
	        	cb(x)

	    	}).catch(err=>{
		        console.log(`${err}`.error)
	    	})
	}
		const brainly = require('brainly-scraper')
		var mes = msg.body.split('!brainly ')[1]
		let tanya = mes.split(/\s/)
		let jum = Number(tanya[tanya.length-1].split('-')[1]) || 2
		if(Number(tanya[tanya.length-1])){
		    tanya.pop()
		}
		let quest = tanya.join(' ')
		msg.reply(`*Pertanyaan : ${quest}*\n*Jumlah jawaban : ${Number(jum)}*`)

		BrainlySearch(quest,Number(jum), function(res){
			console.log(res)
			res.forEach(x=>{
				msg.reply(`*foto pertanyaan*\n${x.fotoPertanyaan.join('\n')}\n*pertanyaan :*\n${x.pertanyaan}\n\n*jawaban :*\n${x.jawaban.judulJawaban}\n*foto jawaban*\n${x.jawaban.fotoJawaban.join('\n')}`)
			})
		})
	} else if (msg.body.startsWith("!sial ")) {
		const request = require('request');
		var req = msg.body;
		var tanggal = req.split(" ")[1];
		var kk = req.split(" ")[2];
		var bulan = kk.replace("0", "");
		var tahun = req.split(" ")[3];
		request.post({
  			headers: {'content-type' : 'application/x-www-form-urlencoded'},
  			url:     'http://www.primbon.com/primbon_hari_naas.php',
  		body: "tgl="+ tanggal +"&bln="+ bulan +"&thn="+ tahun +"&submit=+Submit%21+"
		},function(error, response, body){
    		let $ = cheerio.load(body);
			var y = $.html().split('<b>PRIMBON HARI NAAS</b><br><br>')[1];
    		var t = y.split('.</i><br><br>')[1];
    		var f = y.replace(t ," ");
    		var x = f.replace(/<br\s*[\/]?>/gi, "\n\n");
    		var h  = x.replace(/<[^>]*>?/gm, '');
    		var d = h.replace("&amp;", '&')
			console.log(""+ d);
			msg.reply(`

-----------------------------------

 Cek Hari Naas Kamu ~


 ${d}

-----------------------------------
 		`);
	});
	} else if (msg.body.startsWith("!pasangan ")) {
		const request = require('request');
		var req = msg.body;
		var gh = req.split("!pasangan ")[1];
		var namamu = gh.split("&")[0];
		var pasangan = gh.split("&")[1];
		request.get({
  			headers: {'content-type' : 'application/x-www-form-urlencoded'},
  			url:     'http://www.primbon.com/kecocokan_nama_pasangan.php?nama1='+ namamu +'&nama2='+ pasangan +'&proses=+Submit%21+',

		},function(error, response, body){
    		let $ = cheerio.load(body);
			var y = $.html().split('<b>KECOCOKAN JODOH BERDASARKAN NAMA PASANGAN</b><br><br>')[1];
    		var t = y.split('.<br><br>')[1];
    		var f = y.replace(t ," ");
    		var x = f.replace(/<br\s*[\/]?>/gi, "\n");
    		var h  = x.replace(/<[^>]*>?/gm, '');
    		var d = h.replace("&amp;", '&')
			console.log(""+ d);
			msg.reply(`

-----------------------------------

 *Cek Kecocokan Jodoh Berdasarkan Nama ~*


 ${d}


-----------------------------------
 		`);
	});
	} else if (msg.body == "!wait") {
		const fs = require("fs");
		const { exec } = require("child_process");
		const chat = await msg.getChat();
    	if (msg.hasMedia) {
      		const attachmentData = await msg.downloadMedia();
			fs.writeFileSync("example.jpg", attachmentData.data, {encoding: 'base64'}, function(err) {
    		console.log('File created');
		});
		const fetch = require("node-fetch")
		const imageToBase64 = require('image-to-base64');
		let response = ''
		imageToBase64("example.jpg") // you can also to use url
    		.then(
        	(response) => {
		fetch("https://trace.moe/api/search", {
  			method: "POST",
  			body: JSON.stringify({ image: response}),
  			headers: { "Content-Type": "application/json" }
		})
  			.then(res => res.json())
  			.then(result =>  {
		var teks = `

What Anime Is That ?

Echi / Tidak : *${result.docs[0].is_adult}*
Judul Jepang : *${result.docs[0].title}*
Ejaan Judul : *${result.docs[0].title_romaji}*
Episode : *${result.docs[0].episode}*
Season  : *${result.docs[0].season}*

`;
		var video = `https://trace.moe/preview.php?anilist_id=${result.docs[0].anilist_id}&file=${encodeURIComponent(result.docs[0].filename)}&t=${result.docs[0].at}&token=${result.docs[0].tokenthumb}`;
		exec('wget "' + video + '" -O ./anime/anime.mp4', (error, stdout, stderr) => {

		let media = MessageMedia.fromFilePath('./anime/anime.mp4');
			client.sendMessage(msg.from, media, {
			caption: teks });
			if (error) {
        		console.log(`error: ${error.message}`);
        		return;
    		}
    		if (stderr) {
        		console.log(`stderr: ${stderr}`);
        		return;
    		}

    		console.log(`stdout: ${stdout}`);
		});
 	});
 		}
    		)
    		.catch(
        		(error) => {
            		console.log(error); //Exepection error....
        		}
    		)

			}
		else{
				const tutor = MessageMedia.fromFilePath('tutor.jpeg');

				client.sendMessage(msg.from, tutor, {
        		caption: "Kirim gambar dengan caption *!wait* \n sesuai gambar diatas lalu tunggu sampai \n kita menemukan hasilnya"
      		});
	  		}
	} else if (msg.body.startsWith("!nh ")) {
		const kode = msg.body.split(" ")[1];
		const NanaAPI = require("nana-api");
		const nana = new NanaAPI();
		const https = require("https");
		const fs = require("fs");
		const { exec } = require("child_process");

		// Get gallery from book ID or book link
		nana.g(kode).then((g) => {
		if (g == 'Book not found!'){
			msg.reply("Kode nuklir nya salah , coba perhatiin lagi")
		}else{
			var url = "https://t.nhentai.net/galleries/"+ g.media_id +"/cover.jpg"

			exec('wget "' + url + '" -O ./hentai/cover.jpg', (error, stdout, stderr) => {
 			var teks = "Judul English  : "+ g.title.english.slice("0") +" \n \n Judul Japanese : "+ g.title.japanese +"\n \n Judul Pendek   : "+ g.title.pretty +"\n \n Kode Nuklir    : "+ g.id +" \n ";

		let media = MessageMedia.fromFilePath('./hentai/cover.jpg');
			client.sendMessage(msg.from, media, {
			caption: teks });
			if (error) {
        		console.log(`error: ${error.message}`);
        		return;
    		}
    		if (stderr) {
        		console.log(`stderr: ${stderr}`);
        		return;
    		}

    		console.log(`stdout: ${stdout}`);
		});
	}
})
	} else if (msg.body.startsWith("!doujinshi ")) {
		const kode = msg.body.split(" ")[1];
		const NanaAPI = require("nana-api");
		const nana = new NanaAPI();
		const https = require("https");
		const fs = require("fs");
		const { exec } = require("child_process");

		// Get gallery from book ID or book link
		nana.g(kode).then((g) => {
		if (g == 'Book not found!'){
			msg.reply("Kode nuklir nya salah , coba perhatiin lagi")
		}else{
			var url = "https://t.nhentai.net/galleries/"+ g.media_id +"/cover.jpg"
			var dl = "https://hdl.rurafs.me/download/nhentai/"+ g.id;
			var teks = "Judul English  : "+ g.title.english.slice("0") +" \n \n Judul Japanese : "+ g.title.japanese +"\n \n Judul Pendek   : "+ g.title.pretty +"\n \n Kode Nuklir    : "+ g.id +" \n \n Download Link : "+ dl+"";
			//exec('nhentai --id=' + g.id + ' -P mantap.pdf -o ./ --format=hentong/'+ g.id, (error, stdout, stderr) => {
			exec('wget "' + dl + '" -O hentai/' + g.id + '.pdf', (error, stdout, stderr) => {
				let media = new MessageMedia('application/pdf','hentai/'+ g.id +'/mantap.pdf');
				client.sendMessage(media);
				if (error) {
	        		console.log(`error: ${error.message}`);
        			return;
				}
	    		if (stderr) {
        			console.log(`stderr: ${stderr}`);
        			return;
    			}

    			console.log(`stdout: ${stdout}`);
			});
		}
	})
	} else if (msg.body.startsWith("!ytmp3 ")) {
		var url = msg.body.split(" ")[1];
		var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
		const ytdl = require("ytdl-core")
		const { exec } = require("child_process");
		if(videoid != null) {
   			console.log("video id = ",videoid[1]);
		} else {
    		msg.reply("Videonya gavalid gan.");
		}
		ytdl.getInfo(videoid[1]).then(info => {
		if (info.length_seconds > 3000){
			msg.reply("terlalu panjang.. ")
		}else{
			console.log(info.length_seconds)
			msg.reply(" Tunggu sebentar kak .. Lagi di proses ☺");
			var YoutubeMp3Downloader = require("youtube-mp3-downloader");
			//Configure YoutubeMp3Downloader with your settings
			var YD = new YoutubeMp3Downloader({
	    		"ffmpegPath": "/usr/bin/ffmpeg",
    			"outputPath": "./mp3",    // Where should the downloaded and en>
    			"youtubeVideoQuality": "highest",       // What video quality sho>
    			"queueParallelism": 100,                  // How many parallel down>
    			"progressTimeout": 40                 // How long should be the>
			});
			YD.download(videoid[1]);
			YD.on("finished", function(err, data) {
				var musik = MessageMedia.fromFilePath(data.file);
				msg.reply(`
   Mp3 Berhasil di download

  ----------------------------------

Nama File : *${data.videoTitle}*
Nama : *${data.title}*
Artis : *${data.artist}*

  ----------------------------------
`);
			chat.sendMessage(musik);
			});
		YD.on("error", function(error) {
    		console.log(error);
		});
}});
	} else if (msg.body.startsWith("!tts")) {
		var fs = require('fs')
		const ttsId = require('node-gtts')('id')
		const dataText = msg.body.slice(8)
		const decId = (callback) => {
			ttsId.save('./tts/resId.mp3', dataText, () => {
				console.log('Sukses generate tts id')
				const fileId = fs.readFileSync('./tts/resId.mp3')
				const dataId = fileId.toString('base64')
				console.log(dataId);
				callback(undefined, {
					data: dataId
				})
			  })
		  	}
		const ttsEn = require('node-gtts')('en')
		const decEn = (callback) => {
			ttsEn.save('./tts/resEn.mp3', dataText, () => {
				console.log('Sukses generate tts en')
				const fileEn = fs.readFileSync('./tts/resEn.mp3')
				const dataEn = fileEn.toString('base64')
				console.log(dataEn);
				callback(undefined, {
					data: dataEn
				})
		  	  })
		   	}
		const ttsJa = require('node-gtts')('ja')
		const decJa = (callback) => {
			ttsJa.save('./tts/resJa.mp3', dataText, () => {
				console.log('Sukses generate tts ja')
				const fileJa = fs.readFileSync('./tts/resJa.mp3')
				const dataJa = fileJa.toString('base64')
				console.log(dataJa);
				callback(undefined, {
					data: dataJa
				})
		     })
		   }
		const ttsAr = require('node-gtts')('ar')
		const decAr = (callback) => {
			ttsAr.save('./tts/resAr.mp3', dataText, () => {
				console.log('Sukses generate tts ar')
				const fileAr = fs.readFileSync('./tts/resAr.mp3')
				const dataAr = fileAr.toString('base64')
				console.log(dataAr);
				callback(undefined, {
					data: dataAr
				})
		     })
		   }
		var dataBhs = msg.body.slice(5, 7)
		if (dataBhs === 'en') {
			decEn((error, {data} = {}) => {
				msg.reply(new MessageMedia('audio/mp3', data, 'Me Bot'))
			})
		} else if (dataBhs === 'id') {
			decId((error, {data} = {}) => {
				msg.reply(new MessageMedia('audio/mp3', data, 'Me Bot'))
			})
		} else if (dataBhs === 'jp') {
			decJa((error, {data} = {}) => {
				msg.reply(new MessageMedia('audio/mp3', data, 'Me Bot'))
			})
		} else if (dataBhs == 'ar') {
			decAr((error, {data} = {}) => {
				msg.reply(new MessageMedia('audio/mp3', data, 'Me Bot'))
			})
		}else{
			msg.reply('Masukkan bahasa : [id] untuk indonesia, [en] untuk inggris, [jp] untuk jepang, dan [ar] untuk arab')
		}
	} else if (msg.body.startsWith("!kata-cinta")) {
		const request = require('request');
		request.get({
  			headers: {
			'user-agent' : 'Mozilla/5.0 (Linux; Android 8.1.0; vivo 1820) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Mobile Safari/537.36'
			},
  			url: 'https://jagokata.com/kata-bijak/kata-cinta.html',
			},function(error, response, body){
    			let $ = cheerio.load(body);
    			var author = $('a[class="auteurfbnaam"]').contents().first().text();
   				var kata = $('q[class="fbquote"]').contents().first().text();

				client.sendMessage(
        			msg.from,
        `
     _${kata}_



	*~${author}*
         `
      		);

	});
	} else if (msg.body.startsWith("!nama ")) {
		const cheerio = require('cheerio');
		const request = require('request');
		var nama = msg.body.split("!nama ")[1];
		var req = nama.replace(/ /g,"+");
		request.get({
  			headers: {'content-type' : 'application/x-www-form-urlencoded'},
  			url:     'http://www.primbon.com/arti_nama.php?nama1='+ req +'&proses=+Submit%21+',
			},function(error, response, body){
    			let $ = cheerio.load(body);
    			var y = $.html().split('arti:')[1];
    			var t = y.split('method="get">')[1];
    			var f = y.replace(t ," ");
    			var x = f.replace(/<br\s*[\/]?>/gi, "\n");
    			var h  = x.replace(/<[^>]*>?/gm, '');
			console.log(""+ h);
			msg.reply(
            `
      *Arti Dari Namamu*

  ----------------------------------
         Nama _*${nama}*_ ${h}
  ----------------------------------

`
	        );
	});
	} else if (msg.body.startsWith("!sifat ")) {
		const cheerio = require('cheerio');
		const request = require('request');
		var req = msg.body.split("[")[1].split("]")[0];
		var nama = req.replace(/ /g," ");
		var pesan = msg.body;
		var y = pesan.replace(/ /g,"+ ");
		var tanggal = y.split("]+")[1].split("-")[0];
		var bulan = y.split("-")[1];
		var tahun = y.split("-")[2];
		request.post({
  			headers: {'content-type' : 'application/x-www-form-urlencoded'},
  			url:     'http://www.primbon.com/sifat_karakter_tanggal_lahir.php',
  			body:    "nama="+ req +"&tanggal="+ tanggal +"&bulan="+ bulan +"&tahun="+ tahun +"&submit=+Submit%21+"
		},function(error, response, body){
 			let $ = cheerio.load(body);
    		$('title').after('body')
    		var y = $.html().split('<b>Nama :</b>')[1];
    		var t = y.split('</i><br><br>')[1];
    		var f = y.replace(t ," ");
    		var x = f.replace(/<br\s*[\/]?>/gi, "\n");
    		var h  = x.replace(/<[^>]*>?/gm, '');
			console.log(""+ h);
            msg.reply(`
*Sifat Dari Nama dan Tanggal Lahir*

  ----------------------------------
         Nama ${h}
  ----------------------------------

	`);
});
	} else if (msg.body.startsWith("!yt ")) {
		const url = msg.body.split(" ")[1];
		const exec = require('child_process').exec;
		var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
		const ytdl = require("ytdl-core")
		if(videoid != null) {
   			console.log("video id = ",videoid[1]);
		} else {
    		msg.reply("Videonya gavalid gan.");
		}
		msg.reply(" Tunggu sebentar kak .. Lagi di proses ☺");
		ytdl.getInfo(videoid[1]).then(info => {
		if (info.length_seconds > 1000){
			msg.reply("terlalu panjang.. \n sebagai gantinya \n kamu bisa klik link dibawah ini \π \n "+ info.formats[0].url)
		}else{
			console.log(info.length_seconds)

		function os_func() {
    		this.execCommand = function (cmd) {
        		return new Promise((resolve, reject)=> {
           			exec(cmd, (error, stdout, stderr) => {
             			if (error) {
                			reject(error);
                			return;
            			}
            		resolve(stdout)
           			});
       		})
  		}
	}
		var os = new os_func();
		os.execCommand('ytdl ' + url + ' -q highest -o mp4/'+ videoid[1] +'.mp4').then(res=> {
    		var media = MessageMedia.fromFilePath('mp4/'+ videoid[1] +'.mp4');
			chat.sendMessage(media);
		}).catch(err=> {
    		console.log("os >>>", err);
		})

	}
});
	} else if (msg.body == '!groupInfo') {
		//let chat = await msg.getChat()
		if (chat.isGroup) {
			msg.reply(`
				*Group Details*
				Name : ${chat.name}
				Description : ${chat.description}
				Created At : ${chat.createdAt.toString()}
				Created By : ${chat.owner.user}
				Participant Count : ${chat.participants.length}
			`)
		} else {
			msg.reply('Perintah ini hanya bisa di pakai di grup!')
		}
	} else if (msg.body == "#donasi" ||
    	msg.body === "donasi ") {
    	// Send a new message to the same chat
    	client.sendMessage(msg.from, `
Jika merasa bot ini bermanfaat boleh
Bantu memperpanjang server bot nya
dan agar tetap berjalan dan tidak error

😊 Jika ingin membantu boleh langsung buka link ini
https://saweria.co/donate/mhankbarbar
`);
  	} else if (msg.body == "!rules" ||
    	msg.body === "rules ") {
    	// Send a new message to the same chat
    	client.sendMessage(msg.from, `
• *Jangan spam bot ..*

• *Jangan rusuh kalo bot gaaktif*
• *Jangan telfon / vc bot nya ..*
     ( _auto block_ )
• *Jangan req yang aneh aneh ..*
  _seperti mendownload video ber jam jam_

• *Sesuai kan perintah dengan formatnya..*

_salah format dan bot error = block_

Konsekuensi :

Melanggar rules bot akan keluar
atau member yang nge rusuh harus di kick


Rules ini untuk kenyamanan semua yang memakai
bot ini
`);
	} else if (msg.body == "!randomhentai") {
		const cheerio = require('cheerio');
		const request = require('request');
		const { exec } = require("child_process");
		request.get({
  			headers: {'content-type' : 'application/x-www-form-urlencoded'},
  			url:     'https://api.computerfreaker.cf/v1/nsfwneko',

		},function(error, response, body){
    		let $ = cheerio.load(body);
    		var d = JSON.parse(body);
		console.log(d.url);
		exec('wget "' + d.url + '" -O ./hentai/ok.jpg', (error, stdout, stderr) => {
			var media = MessageMedia.fromFilePath('./hentai/ok.jpg');
			chat.sendMessage(media);
			if (error) {
        		console.log(`error: ${error.message}`);
        		return;
    		}
    		if (stderr) {
        		console.log(`stderr: ${stderr}`);
        		return;
    		}
    		console.log(`stdout: ${stdout}`);
		});
	});
	} else if (msg.body == "!randomanime") {
		const cheerio = require('cheerio');
		const request = require('request');

		const { exec } = require("child_process");
		request.get({
  			headers: {'content-type' : 'application/x-www-form-urlencoded'},
  			url:     'https://api.computerfreaker.cf/v1/anime',

		},function(error, response, body){
    		let $ = cheerio.load(body);
    		var d = JSON.parse(body);
			console.log(d.url);
			exec('wget "' + d.url + '" -O anime/nime.jpg', (error, stdout, stderr) => {
				var media = MessageMedia.fromFilePath('anime/nime.jpg');
				chat.sendMessage(media);
			if (error) {
        		console.log(`error: ${error.message}`);
        		return;
    		}
    		if (stderr) {
        		console.log(`stderr: ${stderr}`);
        		return;
    		}
    		console.log(`stdout: ${stdout}`);
		});
	});
	} else if (msg.body.startsWith("!sendto ")) {
    // Direct send a new message to specific id
    	let number = msg.body.split(" ")[1];
    	let messageIndex = msg.body.indexOf(number) + number.length;
    	let message = msg.body.slice(messageIndex, msg.body.length);
    	number = number.includes("@c.us") ? number : `${number}@c.us`;
    	let chat = await msg.getChat();
    	chat.sendSeen();
    	client.sendMessage(number, message);
    } else if (msg.body == "!menu" || msg.body == '!help') {
 client.sendMessage(msg.from,  `
_Hai kawan, sebelum memakai bot ini patuhi rules dulu ya ._
Ketikan *!rules* untuk melihat rules memakai bot ini

╭──「 List Menu 」
├≽️ !admin
├≽️ !menu1
├≽️ !menu2
╰───────────

`);
	} else if (msg.body == "!admin") {
 		client.sendMessage(msg.from,  `
╭───「 Owner Only 」
├≽️ !subject
├≽️ !kick
├≽️ !promote
├≽️ !demote
├≽️ !add
├≽️ !deskripsi
├≽️ !owner
╰─────────

[ Keterangan ]

» !subject <optional> = Untuk mengganti nama group!
» !kick <@tag> = Kick member group!
» !add 0858xxxxx = Menambahkan member group!
» !promote <@tag> = Menaikkan pangkat member!
» !demote <@tag> = Menurunkan pangkat admin!
» !deskripsi <optional> = Ganti deskripsi group!
» !owner = Melihat siapa owner group!
 `);

	} else if (msg.body == "!menu1") {
		client.sendMessage(msg.from,  `
╭───「 Menu 1 」
├≽ ️!randomanime
├≽️ !wait
├≽️ !translate
├≽️ !tts id/en/jp/ar
├≽️ !lirik
├≽️ !brainly
├≽️ !covid
├≽️ !getall
╰─────────

[ Keterangan ]

» !randomanime = Mengirim gambar anime [ random ]
» !wait = Menampilkan informasi anime, kirim foro dengan caption *!wait*
» !translate = Menerjemahkan kedalam bahasa yang diinginkan
» !ttd id/en/jp/ar = Mengubah teks kedalam suara. \ncontoh :\n!tts id halo jagoan!
» !lirik <optional> = Menampilkan lirik lagu\ncontoh : \n!lirik aku bukan boneka
» !brainly <pertanyaan> <-jumlah> = Menampilkan jawaban dari pertannyaanmu!\ncontoh :\n!brainly NKRI -2
» !covid = Menampilkan informasi covid-19 di indonesia
» !getall = Tag all member dan admin group!
`);

/*
	} else if (msg.body == "!menu2") {
		client.sendMessage(msg.from,  `

*!ytmp3* : Mendownload mp3 dari youtube
contoh : !ytmp3 https://youtu.be/xUVz4nRmxn4

*!fb* : Mendownload video dari facebook
contoh : !fb url

*!igp* : Mendownload media fotodari instagram
contoh : !igp url

*!igv* : Mendownload video dari instagram
contoh : !igv url

`);
}
*/
	} else if (msg.body == "!menu2") {
		client.sendMessage (msg.from, `
╭───「 Menu 2 」
├≽️ !nama
├≽️ !sifat
├≽️ !sial
├≽️ !pasangan
╰─────────

[ Keterangan ]

» !nama <optional> = Melihat arti dari namamu.\ncontoh :\n!nama dewi
» !sifat <optional> = Mencari sifat berdasarkan nama dan tanggal lahir.\ncontoh :\n!sifat dewi 02-02-2002
» !sial <optional> = Cek hari apesmu berdasarkan tanggal lahir.\ncontoh :\n !sial 02 02 2002
» !pasangan <optional> = Cek kecocokan jodoh\ncontoh :\n!pasangan dewi & dani
`);
	} else if (msg.body == "!test") {
		msg.reply(" Hallo silahkan reply pesan ini dan sebutkan umur kamu \n\n dengan format *umur(spasi) umur* \n contoh *umur 21*");
	} else if (msg.body.startsWith('umur ')){
		var umur = msg.body.split(" ")[1];
		if (umur < 18){
			msg.reply(" Hallo umur kamu belum cukup untuk menampilkan menu ini");
		}else{
 client.sendMessage(msg.from,  `

 *!randomhentai* = untuk melihat gambar anime secara random

 *!nh*  kode = untuk melihat info kode nhentai

 *!doujinshi* = untuk mendownload manga dalam bentuk file pdf

 `
	);
}
	} else if (msg.body == "#codebahasa") {
    	msg.reply(`
	Bahasa                Code
######               #####
English                 |  en
Esperanto            |  eo
Estonian              |  et
Finnish                |  fi
French                 |  fr
Frisian                 |  fy
Galician               |  gl
Georgian              |  ka
German               |  de
Greek                   |  el
Gujarati               |  gu
Haitian Creole    |  ht
Hausa                  |  ha
Hawaiian            |  haw (ISO-639-2)
Hebrew               |  he or iw
Hindi                   |  hi
Hmong                |  hmn (ISO-639-2)
Hungarian          |  hu
Icelandic             |  is
Igbo                     |  ig
Indonesian         |  id
Irish                     |  ga
Italian                  |  it
Japanese             |  ja
Javanese              |  jv
Kannada              |  kn
Kazakh                 |  kk
Khmer                  |  km
Kinyarwanda      |  rw
Korean                 |  ko
Kurdish               |  ku
Kyrgyz                |  ky
Lao                      |  lo
Latin                   |  la
Latvian               |  lv
Lithuanian         |  lt
Luxembourg     |  lb
Macedonian      |  mk
Malagasy           |  mg
Malay                 |  ms
Malayalam        |  ml
Maltese               |  mt
Maori                  |  mi
Marathi               |  mr
Myanmar.          |  my
Nepali                 |  ne
Norwegian          |  no
Nyanja.               |  ny
Odia (Oriya)        |  or
Pashto                |  ps
Persian               |  fa
Polish                 |  pl
Portuguese.        |  pt
Punjabi               |  pa
Romanian           |  ro
Russian               |  ru
Samoan               |  sm
Scots Gaelic        |  gd
Serbian               |  sr
Sesotho               |  st
Shona                 |  sn
Sindhi                 |  sd
Slovak                 |  sk
Slovenian            |  sl
Somali                 |  so
Spanish               |  es
Sundanese          |  su
Swahili                |  sw
Swedish               |  sv
Tagalog.               |  tl
Tajik                     |  tg
Tamil                    |  ta
Tatar                     |  tt
Telugu                  |  te
Thai                      |  th
Turkish                |  tr
Turkmen              |  tk
Ukrainian             |  uk
Urdu                      |  ur
Uyghur                  |  ug
Uzbek                    |  uz
Vietnamese          |  vi
Welsh                   |  cy
Xhosa                   |  xh
Yiddish                 |  yi
Yoruba                  |  yo
Zulu                      |  zu
      ` );
  } else if (msg.body == "!leave") {
    	// Leave the group
    	let chat = await msg.getChat();
    	if (chat.isGroup) {
      		chat.leave();
    	} else {
      		msg.reply("This command can only be used in a group!");
    	}
}

});
function col(teks, warna) {
	switch (warna) {
		case 'merah': return '\x1b[31m' + teks + '\x1b[0m'
		case 'ijo': return '\x1b[32m' + teks + '\x1b[0m'
		case 'kuning': return '\x1b[33m' + teks + '\x1b[0m'
		case 'biru': return '\x1b[34m' + teks + '\x1b[0m'
		case 'ungu': return '\x1b[35m' + teks + '\x1b[0m'
		case 'cyan': return '\x1b[36m' + teks + '\x1b[0m'
		case 'putih': return '\x1b[37m' + teks + '\x1b[0m'
		default: return '\x1b[36m' + teks + '\x1b[0m' // default [ cyan ]
	}
}
