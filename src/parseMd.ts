import { marked } from "marked";
import type OpenAI from "openai/index.mjs";
import type { Stream } from "openai/streaming.mjs";

export async function convertToHTML(stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> & {
    _request_id?: string | null;
}, divEle: HTMLDivElement, outputDivEle: HTMLDivElement) {
    var res: { role: string, content: string }[] = [{ role: 'assistant', content: '' }]
    var parseRes: string = ''
    // 保存完整的句子
    var str = ''
    var idCodeChunk = false

    for await (let chunk of stream) {
        str += chunk.choices[0]?.delta?.content ?? ''
        res[0].content += chunk.choices[0]?.delta?.content ?? ''
        // 只有第一个chunk带有role信息
        if (chunk.choices[0]?.delta?.role) {
            res[0].role = chunk.choices[0]?.delta?.role
        }
        if (chunk.choices[0]?.delta?.content?.includes('```')) {
            idCodeChunk = (!idCodeChunk)
        }
        if (chunk.choices[0]?.delta?.content?.includes('\n') && !idCodeChunk) {
            parseRes += marked.parse(str)
            divEle.innerHTML += parseRes
            parseRes = ''
            str = ''
            // 将聊天框的滚动位置设置到底部，确保最新添加的消息始终可见。
            // scrollHeight 是聊天框内容的完整高度，scrollTop 是当前滚动的位置。
            // 将 scrollTop 设置为 scrollHeight 即可滚动到底部。
            outputDivEle.scrollTop = outputDivEle.scrollHeight
        }
    }

    if (str.length != 0) {
        parseRes = marked.parse(str) as string
        divEle.innerHTML += parseRes
    }
    outputDivEle.scrollTop = outputDivEle.scrollHeight
    // console.log(res[0].content)

    return res
}

export async function convertToHTML2(stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> & {
    _request_id?: string | null;
}, divEle: HTMLDivElement, outputDivEle: HTMLDivElement) {
    var res: { role: string, content: string }[] = [{ role: 'assistant', content: '' }]
    var currEle: HTMLElement | null = null
    var isStrong = false
    debugger
    for await (let chunk of stream) {
        var str = chunk.choices[0].delta.content
        res[0].content += chunk.choices[0]?.delta?.content ?? ''
        if (chunk.choices[0]?.delta?.role) {
            res[0].role = chunk.choices[0]?.delta?.role
        }
        // 判断是否是标题
        if (str?.match(/#+/g)) {
            // 根据#的数量创建不同层级的标题HTML元素
            currEle = createEle(`h${str.length}`, `h${str.length}Style`)
            divEle.appendChild(currEle)
            continue
        } else if (str?.match(/(\*+)|(_+)/g)) {
            isStrong = !isStrong
            if (!isStrong) {
                currEle = null
            } else {
                if (str.length == 1) {
                    currEle = createEle(`em`, `emStyle`)
                    divEle.appendChild(currEle)
                } else if (str.length == 2) {
                    currEle = createEle(`strong`, `strongStyle`)
                    divEle.appendChild(currEle)
                } else if (str.length == 3) {
                    currEle = createEle(`strong`, `strongEmStyle`)
                    divEle.appendChild(currEle)
                }
                continue
            }
        }
        // 判断是否是回车符, 收到回车符则可能表示该markdown语法之后已经没有更多的内容
        else if (str?.match(/\n+/g)) {
            currEle = null
        }

        // 如果currEle不为空，则将后续的内容添加到元素内
        if (currEle != null) {
            if (currEle.textContent != undefined) {
                currEle.textContent += str
            }
        }

        outputDivEle.scrollTop = outputDivEle.scrollHeight
    }

    // console.log(res[0].content)

    return res
}

function createEle(name: string, ...attribute: string[]) {
    var ele = document.createElement(name)
    for (var attr of attribute) {
        ele.setAttribute('class', attr)
    }

    return ele
}
