
const modifyCardsUrls = ['cardlist', 'page'];
const modifyStatusesUrls = ['statuses/friends/timeline', 'statuses/unread_friends_timeline', 'statuses/unread_hot_timeline', 'groups/timeline'];
const modifyHomeUrls = 'profile/me';

//个人中心移除选项配置
const homeConfig = {
	removeVip: true,	//移除头像旁边的vip样式
	removeCreatorTask: true,	//移除创作者中心下方的滑动窗口
}

let isDebug = true;

function needModify(url) {
	for (const s of modifyCardsUrls) {
		if(url.indexOf(s) > -1) {
			return true;
		}
	}
	for (const s of modifyStatusesUrls) {
		if(url.indexOf(s) > -1) {
			return true;
		}
	}
	if(url.indexOf(modifyHomeUrls) > -1) {
		return true;
	}
	return false;
}


function isAd(data) {
	if(!data) {
		return false;
	}
	return data.mblogtypename == '广告';
}

function removeCards(data) {
	if(!data.cards) {
		return;
	}
	let newCards = [];
	for (const card of data.cards) {
		let cardGroup = card.card_group;
		if(cardGroup && cardGroup.length > 0) {
			let newGroup = [];
			for (const group of cardGroup) {
				let cardType = group.card_type;
				if(cardType != 118) {
					newGroup.push(group);
				}
			}
			card.card_group = newGroup;
			newCards.push(card);
		} else {
			let cardType = card.card_type;
			if(cardType == 9) {
				if(!isAd(card.mblog)) {
					newCards.push(card);
				}
			} else {
				newCards.push(card);
			}
		}
	}
	data.cards = newCards;
}


function removeTimeLine(data) {
	if(data.ad) {
		data.ad = [];
	}
	if(data.advertises) {
		data.advertises = [];	
	}
	if(!data.statuses) {
		return;
	}
	let newStatuses = [];
	num = 0
	for (const s of data.statuses) {
		num ++;
		if(s.mblogtypename != '广告') {
			newStatuses.push(s);
		}
	}
	data.statuses = newStatuses;
	console.log(num);
	console.log(newStatuses.length);
}

function removeVip(data) {
	if(!homeConfig.removeVip) {
		return;
	}
	if(!data.header) {
		return;
	}
	let vipCenter = data.header.vipCenter;
	if(!vipCenter) {
		return;
	}
	vipCenter.icon = '';
	vipCenter.title.content = '会员中心';
}

function removeHome(data) {
	if(!data.items) {
		return data;
	}
	let newItems = [];
	for (const item of data.items) {
		let itemId = item.itemId;
		if(itemId == 'profileme_mine') {
			removeVip(item);
			newItems.push(item);
		} else if(['100505_-_top8', '100505_-_recentlyuser', '100505_-_chaohua', '100505_-_manage'].indexOf(itemId) > -1) {
			newItems.push(item);
		} else if (itemId == '100505_-_newcreator') {
			if(homeConfig.removeCreatorTask) {
				if(item.type == 'grid') {
					newItems.push(item);
				}
			} else {
				newItems.push(item);
			}
		}
	}
	data.items = newItems;
	console.log(data);
	return data;
}


function modifyMain(url, data) {
	if(isDebug) {
		console.log(new Date());
		console.log(url);
	}
	
	for (const s of modifyCardsUrls) {
		if(url.indexOf(s) > -1) {
			removeCards(data);
			return data;
		}
	}
	for (const s of modifyStatusesUrls) {
		if(url.indexOf(s) > -1) {
			removeTimeLine(data);
			console.log(data.statuses.length);
			console.log(data.statuses);
			return data;
		}
	}
	if(url.indexOf(modifyHomeUrls) > -1) {
		data = removeHome(data);
		return data;
	}
}

var body = $response.body;
var url = $request.url;
if(needModify(url)) {
	var obj = JSON.parse(body);
	obj = modifyMain(url, obj);
	body = JSON.stringify(obj);
}

$done(body);