/**
 * @fileoverview Example to compose HTTP request
 * and handle the response.
 *
 */

const url = "https://rsshub.app/epicgames/freegames";
const method = "GET";

const myRequest = {
    url: url,
    method: method, // Optional, default GET.
};

$task.fetch(myRequest).then(async response => {
    // response.statusCode, response.headers, response.body
    console.log('获取到epic限免返回值');
    const itemRegex = new RegExp(/<item>[\s\S]*?<\/item>/g);
    let itemList =  response.body.match(itemRegex);
    for(let item of itemList){
        let name = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)[1];
        let url = item.match(/<link>([\s\S]*?)<\/link>/)[1];
        let imgurl = item.match(/<img src=\"(.*)\" referrerpolicy/)[1]; 
        let notificationURL = {
            "open-url": url,
            "media-url": imgurl
        }
        let time = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)[1];
        let infoRequest = {
            url: url,
            method: 'GET'
        }
        console.log(`开始获取${name}的详细信息,地址为：${url}`);
        
        let descrRespBody = await $task.fetch(infoRequest).then(descrResponse => descrResponse.body, reason => {
            console.log(`获取${name}详细信息失败`);
            $notify(
                `🎮 [Epic 限免]  ${name}`,
                `⏰ 发布时间: ${formatTime(time)}`,
                `获取游戏简介失败,原因为${reason.error}`
                );
            return null;
        });
        if (descrRespBody){
            console.log(`获取${name}详细信息成功`);
            let content = descrRespBody.replace(/[\r\n]/g,""); 
            let descrResult = content.match(/"description" content="([\s\S]*?)"/);
            let descr = '无法解析';
            if(!descrResult){
                console.log(`获取${name}description匹配失败`);
            }else{
                descr = descrResult[1];
            }
            console.log(`descr ${descr}`);
            $notify(
                `🎮 [Epic 限免]  ${name}`,
                `⏰ 发布时间: ${formatTime(time)}`,
                `💡 游戏简介:\n${descr}`,
                notificationURL
            );
        }
    }
    $done();
}, reason => {
    // reason.error
    $notify("🎮 [Epic 限免] 获取失败", "获取信息失败", `原因为：${reason.error}`); // Error!
    $done();
});



function formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}年${
        date.getMonth() + 1
    }月${date.getDate()}日${date.getHours()}时`;
}