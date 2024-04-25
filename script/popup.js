// 配置变量信息
var defaultConfig = {};
var scribedDisplayDoc = null;
var directlyDisplayDoc = null;

// 与content.js通讯，修改配置并返回配置信息
async function sendToContentAsync(typeValue, dataValue) {
    let tabs = await chrome.tabs.query({active: true, currentWindow: true});
    let res = await chrome.tabs.sendMessage(tabs[0].id, {type: typeValue, data: dataValue});
    return res;
}
function sendToContent(typeValue, dataValue) {
    res = sendToContentAsync(typeValue, dataValue);
    res.then((config) => {
        console.log(config)
        defaultConfig = config;
        scribedDisplayDoc.checked = defaultConfig.scribedDisplay;
        directlyDisplayDoc.checked = defaultConfig.directlyDisplay;
    })
    return res;
}

// 配置相关修改
document.addEventListener('DOMContentLoaded', function() {  
    scribedDisplayDoc = document.getElementById("scribedDisplayId");
    directlyDisplayDoc = document.getElementById("directlyDisplayId");

    sendToContent('config', {});
    
    scribedDisplayDoc.onclick = function() {
        sendToContent('scribedDisplay', this.checked);
    }
    
    directlyDisplayDoc.onclick = function() {
        sendToContent('directlyDisplay', this.checked);
    }
})
