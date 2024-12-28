import { marked } from "marked";
import type OpenAI from "openai/index.mjs";
import type { Stream } from "openai/streaming.mjs";

export async function integrateToMd(stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> & {
    _request_id?: string | null;
}, divEle: HTMLDivElement) 
{
    var res: { role: string, content: string}[] = [{ role: 'assistant', content: '' }]
    var parseRes: string = ''
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
        }
    }

    if (str.length != 0) {
        parseRes = marked.parse(str) as string
        divEle.innerHTML += parseRes
    }

    // console.log(res[0].content)

    return res
}
