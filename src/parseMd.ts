import type { AxiosResponse } from "axios";
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
    var twoToken = ''
    var currEle: HTMLElement | null = null
    var listEle: HTMLElement | null = null
    var blockEle: HTMLElement | null = null
    var pEle: HTMLElement | null = null
    var restStr = ''
    var isStrong = false
    var isUl = false

    debugger
    for await (let chunk of stream) {
        var str = chunk.choices[0].delta.content
        var strForMatch:any = []
        if (restStr.length > 0) {
            str = restStr + str
        }
        if (twoToken.length > 0) {
            twoToken += str
        }
        res[0].content += chunk.choices[0]?.delta?.content ?? ''
        if (chunk.choices[0]?.delta?.role) {
            res[0].role = chunk.choices[0]?.delta?.role
        } 
        if (pEle == null) {
            // 从第二个块开始，如果pEle为空则创建新的段落
            pEle = createEle('p', `paragraphStyle`)
            divEle.appendChild(pEle)
        }
        // 判断是否是标题
        if (str?.match(/#+/g)) {
            strForMatch = str?.match(/#+/g)
            // 根据#的数量创建不同层级的标题HTML元素
            blockEle = createEle(`h${strForMatch[0].length}`, `h${strForMatch[0].length}Style`)
            pEle.appendChild(blockEle)
            continue
        } // 判断是否是粗/斜体 
        else if (str?.match(/(\*+)(?!\s)|(_+)(?!\s)/g) || twoToken?.match(/(\*+)(?!\s)|(_+)(?!\s)/g)) {
            // 如果包含\n说明粗/斜体的内容以及结束
            if (!parseEnter()) {
                // twoToken才能区分是粗/斜体 还是列表
                if (twoToken.length == 0) {
                    twoToken += str
                    continue
                }
                isStrong = !isStrong
                let char = twoToken.match(/(\*+)(?!\s)|(_+)(?!\s)/g)
                twoToken = ''
                if (!isStrong) {
                    currEle = null
                } else if (char) {
                    if (char[0]?.length == 1) { // 斜体
                        currEle = createEle(`em`, `emStyle`)
                    } else if (char[0]?.length == 2) { // 粗体
                        currEle = createEle(`strong`, `strongStyle`)
                    } else if (char[0]?.length == 3) { // 粗斜体
                        currEle = createEle(`strong`, `strongEmStyle`)
                    }
                    // 如果有块元素则添加到块元素，否则添加到 P 标签内
                    if (blockEle != null && currEle != null) {
                        blockEle.appendChild(currEle)
                    } else if (currEle) {
                        pEle.appendChild(currEle)
                    }
                }
            } else {
                let restPart = str?.match(/(?<=\n).*/g)
                if (restPart) {
                    restStr = restPart[0]
                }
            }
        } 
        // 判断是否是无序列表
        else if (twoToken.length >= 2 && twoToken?.match(/(\*\s)|(-\s)/g)) {
            isUl = true
            twoToken = ''
            blockEle = createEle(`ul`, `ulStyle`)
            divEle.appendChild(blockEle)
        }
        // 如果前面都没有匹配到，则说明是只是一个段落
        else if (currEle == null && blockEle == null) {
            if (pEle.textContent != undefined) {
                pEle.textContent += str
            }
        }
        // 判断是否是回车符, 收到回车符则可能表示该markdown语法之后已经没有更多的内容
        parseEnter()

        // 如果currEle不为空，则将后续的内容添加到元素内
        if (currEle != null) {
            if (currEle.textContent != undefined) {
                currEle.textContent += str
            }
        }

        // 是否是块元素
        if (blockEle != null && currEle == null) {
            if (isUl) {
                if (listEle == null) {
                    listEle = createEle(`li`, `liStyle`)
                    blockEle.appendChild(listEle)
                } else if (currEle == null && listEle.textContent != undefined) {
                    listEle.textContent += str
                }
            } else if (blockEle.textContent != undefined) {
                blockEle.textContent += str
            }

        }

        outputDivEle.scrollTop = outputDivEle.scrollHeight
    }

    return res

    function parseEnter() {
        if (str?.match(/\n+/g)) {
            strForMatch = str?.match(/\n+/g)
            // 如果收到2个回车则表示段落结束
            if (strForMatch[0].length == 2) {
                pEle = null
            }
            if (isUl) {
                isUl = false
            }
            if (isStrong) {
                isStrong = false
            }
            currEle = null
            listEle = null
            blockEle = null
            return true
        } 
        return false
    }
}

function createEle(name: string, ...attribute: string[]) {
    var ele = document.createElement(name)
    for (var attr of attribute) {
        ele.setAttribute('class', attr)
    }

    return ele
}

export async function convertToHTML3(stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> & {
    _request_id?: string | null;
}, divEle: HTMLDivElement, outputDivEle: HTMLDivElement) {
    var res: { role: string, content: string }[] = [{ role: 'assistant', content: '' }]
    // 保存完整的句子
    var str = ''

    for await (let chunk of stream) {
        str += chunk.choices[0]?.delta?.content ?? ''
        res[0].content += chunk.choices[0]?.delta?.content ?? ''
        // 只有第一个chunk带有role信息
        if (chunk.choices[0]?.delta?.role) {
            res[0].role = chunk.choices[0]?.delta?.role
        }
        divEle.innerHTML = marked.parse(str) as string
        // 将聊天框的滚动位置设置到底部，确保最新添加的消息始终可见。
        // scrollHeight 是聊天框内容的完整高度，scrollTop 是当前滚动的位置。
        // 将 scrollTop 设置为 scrollHeight 即可滚动到底部。
        outputDivEle.scrollTop = outputDivEle.scrollHeight
    }

    if (str.length != 0) {
        divEle.innerHTML = marked.parse(str) as string
    }
    outputDivEle.scrollTop = outputDivEle.scrollHeight

    return res
}

export async function convertToHTML4(response: AxiosResponse<any, any> & {
    _request_id?: string | null;
}, divEle: HTMLDivElement, outputDivEle: HTMLDivElement) {
    debugger
    const stream = response.data.pipeThrough(new TextDecoderStream())

    for await (let chunk of stream) {
        console.log(chunk)
    }

    return true
}
