const Discord = require('discord.js')
const bot = new Discord.Client()
const token = require('./token.json').token
const fetch = require('node-fetch')
const rarities = [['(Very Common)', ':white_large_square:', '#FFFFFF'], ['(Common)', ':green_square: ', '#32CD32'], ['(Uncommon)', ':blue_square:', '#2a9df4'], ['(Rare)', ':purple_square:', '#800080'], ['(Legendary)', ':yellow_square:', '#FFFF00']]
bot.on('ready', () => {
    console.log(`Online`);
    bot.user.setActivity('Noot | [p!help]', {
        type: 'WATCHING'
    }).catch(console.error);

})
bot.on('message', async message => {
    const gameFetch = await fetch("https://play.prodigygame.com/play");
    const gameStatus = JSON.parse((await gameFetch.text()).match(/(?<=gameStatusDataStr = ').+(?=')/)?.[0]);
    let version = gameStatus.prodigyGameFlags.gameDataVersion
    let prodigydata = await (await fetch(`https://cdn.prodigygame.com/game/data/production/${version}/data.json`)).json()
    let bootdata = prodigydata.boots
    let hatdata = prodigydata.hat
    let weapondata = prodigydata.weapon
    let outfitdata = prodigydata.outfit
    let spellrelicdata = prodigydata.spellRelic
    let petdata = prodigydata.pet
    let spelldata = prodigydata.spell
    let currencydata = prodigydata.currency
    let followdata = prodigydata.follow
    let itemdata = prodigydata.item
    let args = message.content.split(' ')
    switch (args[0]) {
        case 'p!help': const helpemb = new Discord.MessageEmbed()
            .setTitle('ProdigyMathGameBot - Help')
            .setDescription('This bot allows you to access Prodigy items, pets, statistics, and more! Additionally, it syncs with the Prodigy API, so it automatically updates!\n\nCurrent commands:')
            .addField('p!backpack', 'Gives you a list of categories and items. After answering which you want, you can get more detailed info on a single item. | Special items have special data, like potions.')
            .addField('p!petlist', 'Gives you a list of elements and then pets to choose from. After answering which you want, you can get more detailed info on a single item.')
            .addField('p!spellbook', 'Gives you a list of elements and then spells to choose from. After answering which you want, you can get more detailed info on a single spell. | Some spells are outdated and have less data.')
            .addField('p!info', 'Gives info on the bot.')
            .setTimestamp()
            .setThumbnail('https://sso.prodigygame.com/assets/favicon/rebrand-favicon-512x512-6f8e2203ce1008233f00501e4aa6f13845932e5d4a3af8c8cddc17ce88ef474f.png')
            .setFooter(`Requested by ${message.author.tag}.`)
            message.channel.send(helpemb)
            break;
        case 'p!backpack':

            const invembed = new Discord.MessageEmbed()
                .setTitle('Please pick which type of item you would to view:')
                .setDescription('**Choose from one of the following:\nBoots\nHats\nWands\nOutifts\nRelics\nCurrencies\nItems\nBuddies**')
                .setFooter('You have 30 seconds to respond with a valid choice.')
            message.channel.send(invembed)
            message.channel.awaitMessages(m => m.author.id == message.author.id,
                { max: 1, time: 30000000 }).then(collected => {
                    let lowercaseinput = collected.first().content.toLowerCase()
                    let validresponses = ['boots', 'hats', 'wands', 'outfits', 'relics', 'currencies', 'items', 'buddies']
                    let backpackdata = [bootdata, hatdata, weapondata, outfitdata, spellrelicdata, currencydata, itemdata, followdata]
                    if (!validresponses.includes(lowercaseinput)) return;
                    let correctdata = backpackdata[validresponses.indexOf(lowercaseinput)]
                    let entriesarray = []
                    for (i = 0; i < correctdata.length; i++) {
                        for (i = 0; i < correctdata.length; i++) {
                            entriesarray.push(correctdata[i].data.name)
                        }

                    }
                    while (entriesarray.join(', ').length > 1999) {
                        entriesarray.pop()
                    }
                    const pickentryemb = new Discord.MessageEmbed()
                        .setTitle(`Entries for ${lowercaseinput.charAt(0).toUpperCase() + lowercaseinput.slice(1)}-`)
                        .setDescription(`Choose one of the following:\n${entriesarray.join(', ')}`)
                        .setFooter('You have 30 seconds to choose a valid option. | Some results may have been omitted for the proper length of Discord messages.')
                    message.channel.send(pickentryemb)
                    message.channel.awaitMessages(m => m.author.id == message.author.id,
                        { max: 1, time: 30000000 }).then(collected => {
                            collected.first().content = collected.first().content.toLowerCase()
                           for(i = 0; i < entriesarray.length; i++){
                               entriesarray[i] = entriesarray[i].toLowerCase()
                           }
                            if (!entriesarray.includes(collected.first().content)) return;
                            let correctobj = correctdata[entriesarray.indexOf(collected.first().content)]
                            let r = correctobj.data.rarity
                            let isMember = 'Yes'
                            if (!correctobj.data.member) {
                                isMember = 'No'
                            }
                            if (!r) {
                                r = 0
                            }
                            if (!correctobj.data.flavorText) {
                                correctobj.data.flavorText = "No description."
                            }
                            try {
                                const resembed = new Discord.MessageEmbed()
                                    .setTitle(`${correctobj.data.name} - General info`)
                                    .setThumbnail(`https://cdn.prodigygame.com/game/assets/v1_cache/single-images/icon-${correctobj.type}-${correctobj.ID}/${correctobj.metadata.vIcon}/icon-${correctobj.type}-${correctobj.ID}.png`)
                                    .setDescription(`Description: ${correctobj.data.flavorText}`)
                                    .addField(`:gem: Rarity:`, `${rarities[r][1]} ${rarities[r][0]}`)
                                    .addField(`<:membership:746796337105993748> Member-exclusive:`, isMember)
                                    .setColor(rarities[r][2])
                                if (correctobj.data.effect) {
                                    if (correctobj.data.effect.hpPercent) {
                                    resembed.addField(`:heart: Health multipliers:`, `Increases health by +${correctobj.data.effect.hpPercent}`)
                                }}
                                if (correctobj.data.type === 'potion') {
                                correctobj.data.effect = correctobj.data.effect.replace('[bonus-arrow]','<:bonus:748575872151453726>')
                                    resembed.addField(`:crossed_swords: Battle effects:`, correctobj.data.effect)
                                    resembed.addField(`:sparkles: Potency:`, correctobj.data.potency)
                                }
                                if (correctobj.data.name.includes('Morph Marble:')) {
                                    resembed.setThumbnail('https://vignette.wikia.nocookie.net/prodigy-math-game/images/c/c6/MorphMarble.png/revision/latest/top-crop/width/300/height/300?cb=20190610052526')
                                }

                                message.channel.send(resembed)
                            } catch (err) {
                                const erremb = new Discord.MessageEmbed()
                                    .setTitle(`Oops, something went wrong...`)
                                    .setThumbnail('https://i.ibb.co/hYfn2rW/screenshot-nimbus-capture-2020-08-22-16-16-04-1.png')
                                    .setDescription(`**If this error persists, contact <@683792601219989601> for support.**`)
                                message.channel.send(erremb)
                                console.log(err)
                            }
                        })
                })
            break;
        case 'p!petlist':
            var fire = []
            var ice = []
            var earth = []
            var storm = []
            var water = []
            var shadow = []
            let allelements = [fire, ice, earth, storm, water, shadow]
            let elementsasstrings = ['fire', 'ice', 'earth', 'storm', 'water', 'shadow']
            let emojielements = [':fire: Fire', ':ice_cube: Ice', ':mountain: Earth', ':thunder_cloud_rain: Storm', ':droplet: Water', ':new_moon: Shadow']
            for (i = 0; i < petdata.length; i++) {
                if (petdata[i].data.element === "mech") {
                    petdata[i].data.element = "storm"
                }
                eval(`${petdata[i].data.element}.push(petdata[i])`)
            }
            const elementembed = new Discord.MessageEmbed()
                .setTitle('Pick your preferred pet element:')
                .setDescription("**" + emojielements.join('\n\n') + "**")
                .setFooter('You have 30 seconds to respond with a valid choice.')
            message.channel.send(elementembed)
            message.channel.awaitMessages(m => m.author.id == message.author.id,
                { max: 1, time: 30000000 }).then(collected => {
                    if (!elementsasstrings.includes(collected.first().content.toLowerCase())) return;
                    let correctelement = allelements[elementsasstrings.indexOf(collected.first().content.toLowerCase())]
                    let petnames = []
                    for (i = 0; i < correctelement.length; i++) {
                        petnames.push(correctelement[i].data.name)
                    }
                    const petnameembed = new Discord.MessageEmbed()
                        .setTitle(`Pick your preferred ${collected.first().content.charAt(0).toUpperCase() + collected.first().content.slice(1)} pet:`)
                        .setDescription(petnames.join(', '))
                        .setFooter('You have 30 seconds to choose a valid option. | Some results may have been omitted for the proper length of Discord messages.')
                    if (correctelement === shadow) {
                        petnameembed.addField('**Note:**', 'Shadow pet data may be depleted, since they are unable to be collected in-game.')
                    }
                    message.channel.send(petnameembed)
                    message.channel.awaitMessages(m => m.author.id == message.author.id,
                        { max: 1, time: 30000000 }).then(collected => {
                            collected.first().content = collected.first().content.toLowerCase()
                            for(i = 0; i < petnames.length; i++){
                                petnames[i] = petnames[i].toLowerCase()
                            }
                            if (!petnames.includes(collected.first().content)) return;
                            let correctpet = correctelement[petnames.indexOf(collected.first().content)]
                            let nativespells = []
                            let foreignspells = []
                            for (i = 0; i < correctpet.data.nativeSpells.length; i++) {
                                nativespells.push(spelldata[correctpet.data.nativeSpells[i].spell].data.name)
                            }
                            for (i = 0; i < correctpet.data.foreignSpellPools.length; i++) {
                                foreignspells.push(spelldata[correctpet.data.foreignSpellPools[i][0]].data.name)
                            }
                            try {
                                let resembed = new Discord.MessageEmbed()
                                    .setTitle(`${correctpet.data.name} - General Data`)
                                    .setThumbnail(`https://cdn.prodigygame.com/game/assets/v1_cache/single-images/icon-${correctpet.type}-${correctpet.ID}/${correctpet.metadata.vIcon}/icon-${correctpet.type}-${correctpet.ID}.png`)
                                    .setDescription(`Description: ${correctpet.data.flavorText}\n\n**Statistics:**`)
                                    .addField(`:crossed_swords: Power:`, ` **${correctpet.data.power}**`)
                                    .addField(`:heart: Health:`, ` **${correctpet.data.life}**`)
                                    .addField(`<:evolution:747193830981369886> Growth:`, ` **${correctpet.data.growth}**`)
                                    .addField(`:star: Native spells:`, nativespells.join(', '))
                                    .addField(`:star2: Foreign spells (spells the pet has but isn't of their element):`, foreignspells.join(', '))
                                if (correctpet.data.curve[correctpet.data.curve.length - 1].evolveID) {
                                    resembed.addField(`:sparkles: Evolution level:`, correctpet.data.curve[correctpet.data.curve.length - 1].lvl)
                                }
                                message.channel.send(resembed)
                            } catch (err) {
                                console.log(err)
                                const erremb = new Discord.MessageEmbed()
                                    .setTitle(`Oops, something went wrong...`)
                                    .setThumbnail('https://i.ibb.co/hYfn2rW/screenshot-nimbus-capture-2020-08-22-16-16-04-1.png')
                                    .setDescription(`**If this error persists, contact <@683792601219989601> for support.**`)
                                message.channel.send(erremb)
                            }
                        })
                })
            break;
        case 'p!spellbook':
            var fire = []
            var ice = []
            var earth = []
            var storm = []
            var water = []
            var shadow = []
            var astral = []
            let spellelements = [fire, ice, earth, storm, water, shadow, astral]
            let spellsasstrings = ["fire", "ice", "earth", "storm", "water", "shadow", "astral"]
            let emojispells = [':fire: Fire', ':ice_cube: Ice', ':mountain: Earth', ':thunder_cloud_rain: Storm', ':droplet: Water', ':new_moon: Shadow', ':star2: Astral']
            for (i = 0; i < spelldata.length; i++) {
                if (spelldata[i].data.element === "wizard") {
                    spelldata[i].data.element = "astral"
                }
                if (spelldata[i].data.element === "plant") {
                    spelldata[i].data.element = "earth"
                }
                if (spelldata[i].data.epicId != null) {
                    spelldata[i].data.element = petdata[spelldata[i].data.epicId - 1].data.element
                }
                if (spelldata[i].data.element === "mech") {
                    spelldata[i].data.element = "storm"
                }
                if (spelldata[i].data.element) {
                    eval(spelldata[i].data.element + ".push(spelldata[i])")
                }
            }
            const spellelementemb = new Discord.MessageEmbed()
                .setTitle('Pick your preferred spell element:')
                .setDescription(`**${emojispells.join('\n\n')}**`)
                .addField('**Note:**', '**This also contains legacy spells from past Prodigy versions.**')
                .setFooter('You have 30 seconds to respond with a valid choice.')
            message.channel.send(spellelementemb)
            message.channel.awaitMessages(m => m.author.id == message.author.id,
                { max: 1, time: 30000000 }).then(collected => {
                    if (!spellsasstrings.includes(collected.first().content.toLowerCase())) return;
                    let correctspellelement = spellelements[spellsasstrings.indexOf(collected.first().content.toLowerCase())]
                    let spellnames = []
                    for (i = 0; i < correctspellelement.length; i++) {
                        spellnames.push(correctspellelement[i].data.name)
                    }
                    const pickspellemb = new Discord.MessageEmbed()
                        .setTitle(`Choose your preferred ${collected.first().content.charAt(0).toUpperCase() + collected.first().content.slice(1)} spell:`)
                        .setDescription(spellnames.join('\n'))
                        .setFooter('You have 30 seconds to choose a valid option. | Some results may have been omitted for the proper length of Discord messages.')
                    message.channel.send(pickspellemb)
                    message.channel.awaitMessages(m => m.author.id == message.author.id,
                        { max: 1, time: 30000000 }).then(collected => {
                            collected.first().content = collected.first().content.toLowerCase()
                            for(i = 0; i < spellnames.length; i++){
                                spellnames[i] = spellnames[i].toLowerCase()
                            }
                            if (!spellnames.includes(collected.first().content)) return;
                            let correctspell = correctspellelement[spellnames.indexOf(collected.first().content)]
                            let possibledescriptions;
                            if (correctspell.data.tier) {
                                possibledescriptions = `You get this spell after ${correctspell.data.tier - 1} spell evolutions.`
                            } else {
                                if (correctspell.data.epicId) {
                                    possibledescriptions = `This is an Epic Attack, from the Epic ${petdata[correctspell.data.epicId - 1].data.name}.`
                                } else {
                                    possibledescriptions = `This spell is obtained by a unique method.`
                                }
                            }
                            try {
                                const spellemb = new Discord.MessageEmbed()
                                    .setTitle(`${correctspell.data.name} - General Data`)
                                    .setDescription(possibledescriptions)
                                    .addField('Sorry for the lack of info,', 'Working on it!')
                                if (correctspell.data.element === 'fire') {
                                    spellemb.setThumbnail('https://vignette.wikia.nocookie.net/prodigy-math-game/images/e/e5/FireIcon.png/revision/latest?cb=20200320181226')
                                }
                                if (correctspell.data.element === 'ice') {
                                    spellemb.setThumbnail('https://vignette.wikia.nocookie.net/prodigy-math-game/images/4/42/IceIcon.png/revision/latest?cb=20190120195443')
                                }
                                if (correctspell.data.element === 'earth') {
                                    spellemb.setThumbnail('https://vignette.wikia.nocookie.net/prodigy-math-game/images/b/bd/PlantIcon.png/revision/latest?cb=20190120195422')
                                }
                                if (correctspell.data.element === 'storm') {
                                    spellemb.setThumbnail('https://vignette.wikia.nocookie.net/prodigy-math-game/images/f/f0/StormIcon.png/revision/latest?cb=20190120195504')
                                }
                                if (correctspell.data.element === 'water') {
                                    spellemb.setThumbnail('https://vignette.wikia.nocookie.net/prodigy-math-game/images/9/94/WaterIcon.png/revision/latest?cb=20190120195543')
                                }
                                if (correctspell.data.element === 'shadow') {
                                    spellemb.setThumbnail('https://vignette.wikia.nocookie.net/prodigy-math-game/images/2/2c/ShadowElementIconLeak.png/revision/latest?cb=20181014204802')
                                }
                                if (correctspell.data.element === 'astral') {
                                    spellemb.setThumbnail('https://vignette.wikia.nocookie.net/prodigy-math-game/images/e/eb/AstralIcon.png/revision/latest?cb=20190120195400')
                                }
                                if (correctspell.data.targetType) {
                                    if (correctspell.data.targetType === 'single') {
                                        spellemb.addField('Range:', ':bust_in_silhouette: (Single)')
                                    } else {
                                        spellemb.addField('Range:', ':bust_in_silhouette: :bust_in_silhouette: :bust_in_silhouette: (All)')
                                    }
                                }
                                if (correctspell.data.epicId) {
                                    spellemb.addField('Range:', ':bust_in_silhouette: :bust_in_silhouette: :bust_in_silhouette: (All)')
                                    spellemb.addField('<:energy:747505508084089043> Required energy:', `0/10`)
                                }
                                if (correctspell.data.energyCost) {
                                    spellemb.addField('<:energy:747505508084089043> Required energy:', `${correctspell.data.energyCost - 1}/10`)

                                }
                                message.channel.send(spellemb)
                            } catch (err) {
                                console.log(err)
                                const erremb = new Discord.MessageEmbed()
                                    .setTitle(`Oops, something went wrong...`)
                                    .setThumbnail('https://i.ibb.co/hYfn2rW/screenshot-nimbus-capture-2020-08-22-16-16-04-1.png')
                                    .setDescription(`**If this error persists, contact <@683792601219989601> for support.**`)
                                message.channel.send(erremb)
                            }
                        })
                })
            break;
        case 'p!info':
            const infoemb = new Discord.MessageEmbed()
                .setTitle('ProdigyMathGameBot- Info')
                .setDescription('All commands are created and maintained by <@683792601219989601>\nDependencies:\n\n`node-fetch`\n`discord.js`')
                .setTimestamp()
                .setThumbnail('https://sso.prodigygame.com/assets/favicon/rebrand-favicon-512x512-6f8e2203ce1008233f00501e4aa6f13845932e5d4a3af8c8cddc17ce88ef474f.png')
                .setFooter(`Requested by ${message.author.tag}.`)
            message.channel.send(infoemb)
            break;
            case 'p!eval':
                args.shift()
        
            if(message.author.id !== '683792601219989601') return;
            try {
                function clean(text) {
                    if (typeof(text) === "string")
                      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
                    else
  return text;
                  }
                const code = args.join(" ");
              let evaled = eval(code);
         
              if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);
         
              message.channel.send(clean(evaled), {code:"js"});
            } catch (err) {
              message.channel.send(` \`\`\`js\n${clean(err)}\n\`\`\``);
            }
    }
})
bot.login(token)