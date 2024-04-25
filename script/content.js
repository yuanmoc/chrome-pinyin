var popup = null;
var lastText = null;
var { pinyin } = pinyinPro;
var defaultConfig = {
    scribedDisplay: true,
    directlyDisplay: false
}
// 从store中获取配置信息
defaultConfig.scribedDisplay = localStorage.getItem('scribedDisplay') == 'false' ? false : true;
defaultConfig.directlyDisplay = localStorage.getItem('directlyDisplay') == 'true' ? true : false;

// 初始化信息
if (defaultConfig.scribedDisplay) {
    document.addEventListener("mouseup", mouseUpListener);
}
if (defaultConfig.directlyDisplay) {
    addPinyinToTextNodes(document.body);
}

// 接收popups.js通信信息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    type = request.type
    data = request.data;
    console.log(request, 'request')
    switch(type) {
        case 'scribedDisplay':
            if (data) {
                document.addEventListener("mouseup", mouseUpListener);
            } else {
                document.removeEventListener("mouseup", mouseUpListener);
            }
            localStorage['scribedDisplay'] = data;
            defaultConfig.scribedDisplay = data;    
            sendResponse(defaultConfig);
            break;
        case 'directlyDisplay':
            if (data) {
                addPinyinToTextNodes(document.body);
            } else {
                location.reload();
            }
            localStorage['directlyDisplay'] = data;
            defaultConfig.directlyDisplay = data;    
            sendResponse(defaultConfig);
            break;
            
        case 'config':
            sendResponse(defaultConfig);
            break;
    }
    return true;
});

// ----- 划词 start -------
// 添加事件监听器，并保存引用  
var mouseUpListener = function(event) {
    handleMouseUp(event);  
}

function handleMouseUp(event) {
    var selectedText = window.getSelection().toString();
    showPopup(event.pageX, event.pageY, selectedText);
}

function showPopup(x, y, text) {
    if (popup) {
        popup.remove();
    }
    if (lastText == text) {
        return;
    }
    lastText = text;
    if (text == '') {
        return;
    }
    popup = document.createElement('div');
    text = pinyin(text);
    popup.style.position = 'absolute';
    popup.style.top = `${y-30}px`;
    popup.style.left = `${x+20}px`;
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    popup.style.color = '#fff';
    popup.style.padding = '5px';
    popup.style.borderRadius = '3px';
    popup.style.zIndex = '9999';
    popup.style.display = 'block';
    popup.textContent = text;

    document.body.appendChild(popup);
}
// ----- 划词 end -------


// ----- 文本html显示拼音 start ------

// 定义一个函数来遍历节点并替换汉字为 HTML 节点
function addPinyinToTextNodes(node) {
    // 检查节点的类型是否为元素节点
    if (node.nodeType === Node.ELEMENT_NODE) {
        // 如果节点有子节点，则递归遍历子节点
        if (node.childNodes.length > 0) {
            for (var i = 0; i < node.childNodes.length; i++) {
                addPinyinToTextNodes(node.childNodes[i]);
            }
        }
    } 
    // 如果节点的类型为文本节点，则替换其中的汉字为 HTML 节点
    else if (node.nodeType === Node.TEXT_NODE) {
        // 使用正则表达式匹配汉字
        var chineseRegex = /[\u4e00-\u9fa5]/;
        if (chineseRegex.test(node.nodeValue)) {
            var text = node.nodeValue;
            var html = '';
            for (var j = 0; j < text.length; j++) {
                var char = text[j];
                // 如果是汉字，则替换为 <span> 元素
                if (chineseRegex.test(char)) {
                    pinyinChar = pinyin(char)
                    html += '<span class="yuanmoc-chinese">' + char + '<span class="yuanmoc-pinyin">' + pinyinChar + '</span></span>';
                } else {
                    html += char;

                }
            }
            // 创建一个新的元素节点，并替换文本节点
            var newNode = document.createElement('span');
            newNode.innerHTML = html;
            node.parentNode.replaceChild(newNode, node);
        }
    }
}

// ----- 文本html显示拼音  end ------